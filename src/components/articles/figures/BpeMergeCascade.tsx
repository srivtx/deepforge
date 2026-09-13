const END = "\u00B7";

interface Row {
  symbols: string[];
  label: string;
}

const ROWS: Row[] = [
  {
    symbols: ["n", "e", "w", "e", "s", "t", END],
    label: "step 1 \u00B7 merge e + s \u00B7 seen 9\u00D7",
  },
  {
    symbols: ["n", "e", "w", "es", "t", END],
    label: "step 2 \u00B7 merge es + t \u00B7 seen 9\u00D7",
  },
  {
    symbols: ["n", "e", "w", "est", END],
    label: "step 3 \u00B7 merge est + \u00B7 \u00B7 seen 9\u00D7",
  },
  {
    symbols: ["n", "e", "w", `est${END}`],
    label: "fully merged \u00B7 newest\u00B7 is one token",
  },
];

const COUNTS = [95, 86, 77, 68];
const COUNT_LABELS = ["start", "#1", "#2", "#3"];

const ROW_Y = [76, 132, 188, 244];
const BOX_H = 26;
const PAIR_FIRST = 3;

const BAR_X = [488, 552, 616, 680];
const BAR_W = 44;
const BAR_BASE = 280;
const BAR_MAX = 168;

function layout(symbols: string[]) {
  const boxes: { x: number; width: number; center: number }[] = [];
  let x = 44;
  for (const symbol of symbols) {
    const width = Math.max(24, symbol.length * 8 + 12);
    boxes.push({ x, width, center: x + width / 2 });
    x += width + 6;
  }
  return boxes;
}

const LAYOUTS = ROWS.map((row) => layout(row.symbols));

export function BpeMergeCascade() {
  return (
    <svg
      viewBox="0 0 760 340"
      role="img"
      aria-labelledby="bpecascade-title bpecascade-desc"
      className="h-auto w-full"
    >
      <title id="bpecascade-title">
        Three BPE merges on the word newest
      </title>
      <desc id="bpecascade-desc">
        The word newest with its end marker passes through three merge steps.
        Step one merges e and s into es, step two merges es and t into est, and
        step three merges est with the end marker. The chosen pair is boxed at
        every step, and the corpus token count falls from 95 to 86 to 77 to 68,
        because each merge removes the pair&apos;s frequency in tokens.
      </desc>
      <defs>
        <marker
          id="bpecascade-arrow"
          viewBox="0 0 10 10"
          refX="8"
          refY="5"
          markerWidth="6"
          markerHeight="6"
          orient="auto"
        >
          <path d="M0 0 10 5 0 10z" className="fill-accent/70" />
        </marker>
      </defs>

      <text x={30} y={28} className="fill-ink text-[12.5px] font-medium">
        one word through three merges
      </text>
      <text x={30} y={44} className="fill-body-mid text-[9.5px] font-mono">
        newest{END} after each BPE step &middot; the chosen pair is boxed
      </text>

      {ROWS.map((row, i) => {
        const boxes = LAYOUTS[i];
        const y = ROW_Y[i];
        const hasPair = i < ROWS.length - 1;
        const pairX = hasPair ? boxes[PAIR_FIRST].x - 3 : 0;
        const pairRight = hasPair
          ? boxes[PAIR_FIRST + 1].x + boxes[PAIR_FIRST + 1].width
          : 0;
        const pairWidth = hasPair ? pairRight - boxes[PAIR_FIRST].x + 6 : 0;
        const fromX = hasPair ? (boxes[PAIR_FIRST].x + pairRight) / 2 : 0;
        const nextBox = hasPair ? LAYOUTS[i + 1][PAIR_FIRST] : null;
        return (
          <g key={i}>
            {hasPair && (
              <rect
                x={pairX}
                y={y - 4}
                width={pairWidth}
                height={BOX_H + 8}
                rx={6}
                strokeWidth={1.5}
                className="fill-accent/5 stroke-accent"
              />
            )}
            {boxes.map((box, j) => {
              const merged = i > 0 && j === PAIR_FIRST;
              return (
                <g key={j}>
                  <rect
                    x={box.x}
                    y={y}
                    width={box.width}
                    height={BOX_H}
                    rx={4}
                    strokeWidth={merged ? 1.5 : 1}
                    className={
                      merged
                        ? "fill-accent/15 stroke-accent"
                        : "fill-canvas stroke-hairline"
                    }
                  />
                  <text
                    x={box.center}
                    y={y + 17}
                    textAnchor="middle"
                    className={
                      merged
                        ? "fill-accent text-[12.5px] font-mono"
                        : "fill-body text-[12.5px] font-mono"
                    }
                  >
                    {row.symbols[j]}
                  </text>
                </g>
              );
            })}
            <text x={270} y={y + 16} className="fill-body-mid text-[9.5px] font-mono">
              {row.label}
            </text>
            {nextBox && (
              <path
                d={`M${fromX} ${y + BOX_H + 5} L${fromX} ${y + BOX_H + 16} L${nextBox.center} ${y + BOX_H + 16} L${nextBox.center} ${ROW_Y[i + 1] - 6}`}
                fill="none"
                strokeWidth={1.2}
                strokeDasharray="3 3"
                markerEnd="url(#bpecascade-arrow)"
                className="stroke-accent/70"
              />
            )}
          </g>
        );
      })}

      <text x={470} y={28} className="fill-ink text-[12px] font-medium">
        corpus tokens
      </text>
      <text x={470} y={44} className="fill-mute text-[9px] font-mono">
        low&times;5 &middot; lower&times;2 &middot; newest&times;6 &middot;
        widest&times;3
      </text>
      <path d={`M470 ${BAR_BASE}H742`} fill="none" strokeWidth={1} className="stroke-hairline" />
      {COUNTS.map((count, i) => {
        const h = (count / COUNTS[0]) * BAR_MAX;
        return (
          <g key={i}>
            <rect
              x={BAR_X[i]}
              y={BAR_BASE - h}
              width={BAR_W}
              height={h}
              rx={3}
              className="fill-accent"
              fillOpacity={0.3 + i * 0.2}
            />
            <text
              x={BAR_X[i] + BAR_W / 2}
              y={BAR_BASE - h - 6}
              textAnchor="middle"
              className="fill-accent text-[11px] font-mono"
            >
              {count}
            </text>
            <text
              x={BAR_X[i] + BAR_W / 2}
              y={BAR_BASE + 14}
              textAnchor="middle"
              className="fill-mute text-[9px] font-mono"
            >
              {COUNT_LABELS[i]}
            </text>
          </g>
        );
      })}

      <text x={30} y={322} className="fill-accent text-[10.5px]">
        every merge removes the pair&apos;s count from the corpus: 95 &rarr; 86
        &rarr; 77 &rarr; 68
      </text>
    </svg>
  );
}
