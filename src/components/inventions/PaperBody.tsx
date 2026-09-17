import type {
  InventionBlock,
  InventionFigure,
  InventionPaper,
} from "@/data/inventions/types";

/**
 * Server component that renders a full invention paper: numbered sections,
 * paragraphs, lists, formulas, code, tables, deterministic inline-SVG
 * figures, callouts, and the numbered reference list.
 *
 * Everything is server-rendered with no client JavaScript, so the page works
 * with JS disabled and Ctrl+P prints the same document the PDF contains.
 */

const FIGURE_WIDTH = 720;
const FIGURE_HEIGHT = 340;
const FIGURE_MARGIN = { top: 38, right: 16, bottom: 74, left: 48 };

function Figure({ figure }: { figure: InventionFigure }) {
  const groups = figure.series[0]?.bars.length ?? 0;
  const seriesCount = figure.series.length;
  const plotWidth = FIGURE_WIDTH - FIGURE_MARGIN.left - FIGURE_MARGIN.right;
  const plotHeight = FIGURE_HEIGHT - FIGURE_MARGIN.top - FIGURE_MARGIN.bottom;
  const groupWidth = groups > 0 ? plotWidth / groups : plotWidth;
  const barWidth = Math.min(30, Math.max(8, (groupWidth * 0.6) / seriesCount));
  const barGap = 6;
  const baseline = FIGURE_MARGIN.top + plotHeight;
  const titleId = `figure-${figure.id}-title`;
  const descId = `figure-${figure.id}-desc`;

  const y = (value: number) =>
    FIGURE_MARGIN.top + plotHeight * (1 - value / figure.max);

  const ticks = [0, 1, 2, 3].map((step) => (figure.max * step) / 3);

  return (
    <figure className="rounded-lg border border-hairline bg-canvas-card p-3 sm:p-4 print:break-inside-avoid">
      <svg
        viewBox={`0 0 ${FIGURE_WIDTH} ${FIGURE_HEIGHT}`}
        role="img"
        aria-labelledby={`${titleId} ${descId}`}
        className="h-auto w-full"
      >
        <title id={titleId}>{figure.title}</title>
        <desc id={descId}>{figure.caption}</desc>

        {figure.series.map((series, index) => (
          <g key={series.label}>
            <rect
              x={FIGURE_MARGIN.left + index * 116}
              y={12}
              width={10}
              height={10}
              rx={2}
              className={
                index === 0 ? "fill-current text-mute" : "fill-current text-accent"
              }
            />
            <text
              x={FIGURE_MARGIN.left + index * 116 + 16}
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
              x1={FIGURE_MARGIN.left}
              x2={FIGURE_WIDTH - FIGURE_MARGIN.right}
              y1={y(tick)}
              y2={y(tick)}
              className="stroke-hairline"
              strokeWidth={1}
            />
            <text
              x={FIGURE_MARGIN.left - 8}
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
              x1={FIGURE_MARGIN.left}
              x2={FIGURE_WIDTH - FIGURE_MARGIN.right}
              y1={y(figure.gate)}
              y2={y(figure.gate)}
              strokeDasharray="5 4"
              strokeWidth={1}
              className="stroke-current text-body-mid"
            />
            <text
              x={FIGURE_WIDTH - FIGURE_MARGIN.right}
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
            const groupLeft = FIGURE_MARGIN.left + barIndex * groupWidth;
            const x =
              groupLeft +
              (groupWidth - clusterWidth) / 2 +
              seriesIndex * (barWidth + barGap);
            const top = y(bar.value);
            const height = Math.max(1, baseline - top);
            return (
              <g key={`${series.label}-${bar.label}`}>
                <rect
                  x={x}
                  y={top}
                  width={barWidth}
                  height={height}
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

        {(figure.series[0]?.bars ?? []).map((bar, barIndex) => (
          <text
            key={bar.label}
            x={FIGURE_MARGIN.left + barIndex * groupWidth + groupWidth / 2}
            y={baseline + 26}
            textAnchor="middle"
            fontSize={12}
            className="fill-current text-body-mid"
          >
            {bar.label}
          </text>
        ))}
      </svg>
      <figcaption className="mt-2 text-xs leading-relaxed text-body-mid">
        <span className="font-medium text-body">{figure.title}.</span>{" "}
        {figure.caption}{" "}
        <span className="text-mute">{figure.unit}.</span>
      </figcaption>
    </figure>
  );
}

function BlockView({ block }: { block: InventionBlock }) {
  switch (block.kind) {
    case "paragraph":
      return (
        <p className="text-sm leading-relaxed text-body">{block.text}</p>
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
              {item}
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
          <p className="mt-1 text-sm leading-relaxed text-body">{block.text}</p>
        </aside>
      );
  }
}

export function PaperBody({ paper }: { paper: InventionPaper }) {
  return (
    <div className="flex flex-col gap-10">
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
              <BlockView key={blockIndex} block={block} />
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
