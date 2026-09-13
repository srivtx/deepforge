const WEIGHTS = [
  [0.17, 0.16, 0.18, 0.16, 0.17, 0.16],
  [0.1, 0.55, 0.15, 0.08, 0.07, 0.05],
  [0.02, 0.03, 0.9, 0.02, 0.02, 0.01],
  [0.3, 0.1, 0.1, 0.1, 0.25, 0.15],
  [0.167, 0.167, 0.166, 0.167, 0.166, 0.167],
  [0.05, 0.05, 0.1, 0.65, 0.1, 0.05],
];

const SHARP_ROW = 2;
const FLAT_ROW = 4;
const CELL = 40;
const X0 = 80;
const Y0 = 76;
const CAUSAL_X = 460;
const CAUSAL_Y = 76;
const CAUSAL_CELL = 38;

function cellOpacity(weight: number) {
  return 0.08 + 0.92 * (weight / 0.9);
}

export function AttentionHeatmap() {
  return (
    <svg
      viewBox="0 0 760 360"
      role="img"
      aria-labelledby="attnheatmap-title attnheatmap-desc"
      className="h-auto w-full"
    >
      <title id="attnheatmap-title">
        Attention weights per row and a causal-mask variant
      </title>
      <desc id="attnheatmap-desc">
        A six by six attention weight matrix. Every row sums to one, shown in
        the right column. Row q3 is peaked, with 0.90 on a single key, while row
        q5 is nearly flat at about 0.17 on every key. To the right, the causal
        mask variant keeps the upper triangle at zero so each row can only
        attend to itself and earlier tokens.
      </desc>

      <text x={30} y={30} className="fill-mute text-[10px] font-mono">
        A = softmax(Q·Kᵀ / √d_k)
      </text>
      <text x={372} y={30} textAnchor="end" className="fill-accent text-[10px] font-mono">
        every row sums to 1
      </text>

      {Array.from({ length: 6 }, (_, j) => (
        <text
          key={`col-${j}`}
          x={X0 + j * CELL + (CELL - 2) / 2}
          y={Y0 - 10}
          textAnchor="middle"
          className="fill-body-mid text-[9.5px] font-mono"
        >
          k{j + 1}
        </text>
      ))}
      <text x={X0 + 6 * CELL + 12} y={Y0 - 10} className="fill-mute text-[10px] font-mono">
        Σ
      </text>

      {WEIGHTS.map((row, i) => (
        <text
          key={`row-${i}`}
          x={X0 - 12}
          y={Y0 + i * CELL + (CELL - 2) / 2}
          textAnchor="end"
          dominantBaseline="middle"
          className={
            i === SHARP_ROW
              ? "fill-accent text-[9.5px] font-mono"
              : i === FLAT_ROW
                ? "fill-info text-[9.5px] font-mono"
                : "fill-body-mid text-[9.5px] font-mono"
          }
        >
          q{i + 1}
        </text>
      ))}

      {WEIGHTS.map((row, i) =>
        row.map((weight, j) => (
          <rect
            key={`cell-${i}-${j}`}
            x={X0 + j * CELL}
            y={Y0 + i * CELL}
            width={CELL - 2}
            height={CELL - 2}
            rx={2}
            strokeWidth={1}
            fillOpacity={cellOpacity(weight)}
            className="fill-accent stroke-hairline"
          />
        )),
      )}

      <rect
        x={X0 - 4}
        y={Y0 + SHARP_ROW * CELL - 4}
        width={6 * CELL + 8}
        height={CELL + 8}
        rx={3}
        fill="none"
        strokeWidth={1.5}
        className="stroke-accent/70"
      />
      <rect
        x={X0 - 4}
        y={Y0 + FLAT_ROW * CELL - 4}
        width={6 * CELL + 8}
        height={CELL + 8}
        rx={3}
        fill="none"
        strokeWidth={1.5}
        className="stroke-info/60"
      />

      <text
        x={X0 + 2 * CELL + (CELL - 2) / 2}
        y={Y0 + 2 * CELL + (CELL - 2) / 2}
        textAnchor="middle"
        dominantBaseline="middle"
        className="fill-canvas text-[9.5px] font-mono"
      >
        0.90
      </text>

      {WEIGHTS.map((_, i) => (
        <text
          key={`sum-${i}`}
          x={X0 + 6 * CELL + 12}
          y={Y0 + i * CELL + (CELL - 2) / 2}
          dominantBaseline="middle"
          className="fill-mute text-[9.5px] font-mono"
        >
          1.00
        </text>
      ))}

      <path d="M80 332H104" fill="none" strokeWidth={2.5} className="stroke-accent" />
      <text x={112} y={336} className="fill-body-mid text-[10px]">
        q3 peaked — 0.90 lands on one key
      </text>
      <path d="M80 350H104" fill="none" strokeWidth={2.5} className="stroke-info" />
      <text x={112} y={354} className="fill-body-mid text-[10px]">
        q5 flat — attention spread at ≈0.17 across keys
      </text>

      <text x={CAUSAL_X} y={38} className="fill-ink text-[11.5px] font-medium">
        causal mask
      </text>
      <text x={CAUSAL_X} y={52} className="fill-body-mid text-[9.5px] font-mono">
        future scores → −∞, weight 0
      </text>

      {Array.from({ length: 6 }, (_, j) => (
        <text
          key={`causal-col-${j}`}
          x={CAUSAL_X + j * CAUSAL_CELL + (CAUSAL_CELL - 2) / 2}
          y={68}
          textAnchor="middle"
          className="fill-mute text-[9px] font-mono"
        >
          k{j + 1}
        </text>
      ))}
      {Array.from({ length: 6 }, (_, i) => (
        <text
          key={`causal-row-${i}`}
          x={CAUSAL_X - 8}
          y={CAUSAL_Y + i * CAUSAL_CELL + (CAUSAL_CELL - 2) / 2}
          textAnchor="end"
          dominantBaseline="middle"
          className="fill-mute text-[9px] font-mono"
        >
          q{i + 1}
        </text>
      ))}

      {WEIGHTS.map((_, i) =>
        Array.from({ length: 6 }, (_, j) => {
          const allowed = j <= i;
          return (
            <rect
              key={`causal-${i}-${j}`}
              x={CAUSAL_X + j * CAUSAL_CELL}
              y={CAUSAL_Y + i * CAUSAL_CELL}
              width={CAUSAL_CELL - 2}
              height={CAUSAL_CELL - 2}
              rx={2}
              strokeWidth={1}
              fillOpacity={allowed ? 0.15 + 0.85 / (i + 1) : 0}
              className={allowed ? "fill-accent stroke-hairline" : "fill-canvas-soft stroke-hairline"}
            />
          );
        }),
      )}
      <path
        d={`M${CAUSAL_X} ${CAUSAL_Y}L${CAUSAL_X + 6 * CAUSAL_CELL} ${CAUSAL_Y + 6 * CAUSAL_CELL}`}
        fill="none"
        strokeWidth={1.5}
        className="stroke-accent/40"
      />
      <text
        x={628}
        y={118}
        textAnchor="middle"
        className="fill-mute text-[9.5px] font-mono"
      >
        masked
      </text>
      <text x={CAUSAL_X} y={330} className="fill-body-mid text-[10px]">
        each row renormalizes over the past only
      </text>
    </svg>
  );
}
