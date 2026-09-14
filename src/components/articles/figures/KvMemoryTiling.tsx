const AX = 62;
const AY = 300;
const A_TOP = 74;
const SCALE = (AY - A_TOP) / 160;

function memY(gb: number): number {
  return AY - gb * SCALE;
}

function ctxX(tokens: number): number {
  const log2 = Math.log2(tokens);
  return AX + ((log2 - 12) / 5) * (400 - AX);
}

const POINTS = [4096, 16384, 32768, 131072];
const WEIGHTS_GB = 14;
const TOTALS_GB = [18.3, 30.3, 46.3, 142.4];

const AREA_X = POINTS.map(ctxX);
const WEIGHT_Y = memY(WEIGHTS_GB);
const TOTAL_Y = TOTALS_GB.map(memY);

const totalPath = [
  `M${AREA_X[0]} ${AY}`,
  `L${AREA_X[0]} ${TOTAL_Y[0]}`,
  ...TOTAL_Y.slice(1).map((y, i) => `L${AREA_X[i + 1]} ${y}`),
  `L${AREA_X[3]} ${AY}`,
  "Z",
].join(" ");

const weightPath = [
  `M${AREA_X[0]} ${AY}`,
  `L${AREA_X[0]} ${WEIGHT_Y}`,
  `L${AREA_X[3]} ${WEIGHT_Y}`,
  `L${AREA_X[3]} ${AY}`,
  "Z",
].join(" ");

const TILE = [0, 1, 2, 3];

export function KvMemoryTiling() {
  return (
    <svg
      viewBox="0 0 760 400"
      role="img"
      aria-labelledby="kvtile-title kvtile-desc"
      className="h-auto w-full"
    >
      <title id="kvtile-title">
        KV cache growth versus model weights, and tiled attention in SRAM
      </title>
      <desc id="kvtile-desc">
        Left: a stacked area chart of GPU memory against context length on a
        log scale. Model weights stay flat at 14 gigabytes while the KV cache
        grows from about 4 gigabytes at 4k tokens, to 16 at 16k, 32 at 32k and
        128 at 128k, for eight concurrent sequences with grouped-query
        attention. At 128k the cache is roughly nine times the weights. Right:
        a tiling diagram where K and V blocks stream from HBM into SRAM one
        tile at a time. The score tile is computed in SRAM together with a
        running maximum m and sum l, so the full n by n score matrix is never
        materialized in HBM; the matrix is drawn ghosted with a cross over it.
      </desc>

      <text x={30} y={26} className="fill-ink text-[12.5px] font-medium">
        the cache grows with every token; the weights do not
      </text>
      <text x={30} y={42} className="fill-mute text-[9.5px] font-mono">
        7B model bf16 &middot; 32 layers &middot; 8 concurrent sequences &middot; GQA-8 &middot; head dim 128
      </text>

      <line x1={AX} y1={AY} x2={400} y2={AY} className="stroke-hairline" strokeWidth="1.5" />
      <line x1={AX} y1={AY} x2={AX} y2={A_TOP} className="stroke-hairline" strokeWidth="1.5" />
      {[0, 50, 100, 150].map((gb) => (
        <g key={gb}>
          <line
            x1={AX}
            y1={memY(gb)}
            x2={400}
            y2={memY(gb)}
            className="stroke-hairline"
            strokeDasharray="3 5"
          />
          <text x={AX - 8} y={memY(gb) + 3} textAnchor="end" className="fill-mute text-[9px] font-mono">
            {gb}
          </text>
        </g>
      ))}
      <text
        x={AX - 8}
        y={A_TOP - 10}
        textAnchor="end"
        className="fill-mute text-[9px] font-mono"
      >
        GB
      </text>

      <path d={totalPath} className="fill-accent/20" />
      <path d={weightPath} className="fill-info/25" />
      <path
        d={[
          `M${AREA_X[0]} ${TOTAL_Y[0]}`,
          ...TOTAL_Y.slice(1).map((y, i) => `L${AREA_X[i + 1]} ${y}`),
        ].join(" ")}
        fill="none"
        strokeWidth="1.5"
        className="stroke-accent"
      />
      <line
        x1={AREA_X[0]}
        y1={WEIGHT_Y}
        x2={AREA_X[3]}
        y2={WEIGHT_Y}
        strokeWidth="1.5"
        className="stroke-info"
      />

      {AREA_X.map((x, i) => (
        <g key={x}>
          <circle cx={x} cy={TOTAL_Y[i]} r={3.5} className="fill-accent" />
          <text
            x={x}
            y={AY + 18}
            textAnchor="middle"
            className="fill-body-mid text-[9.5px] font-mono"
          >
            {POINTS[i] / 1024}k
          </text>
        </g>
      ))}

      <text x={AREA_X[0] + 8} y={WEIGHT_Y + 14} className="fill-info text-[9.5px] font-mono">
        weights 14 GB
      </text>
      <text x={AREA_X[1] + 10} y={TOTAL_Y[1] - 18} className="fill-accent text-[9.5px] font-mono">
        KV 16 GB
      </text>
      <text x={AREA_X[3] - 6} y={TOTAL_Y[3] - 12} textAnchor="end" className="fill-warning text-[10.5px] font-mono">
        128 GB &middot; 9&times; weights
      </text>
      <line
        x1={ctxX(16384)}
        y1={A_TOP}
        x2={ctxX(16384)}
        y2={AY}
        strokeDasharray="4 4"
        className="stroke-warning/70"
      />
      <text x={ctxX(16384)} y={A_TOP - 4} textAnchor="middle" className="fill-warning text-[9px] font-mono">
        crossover &asymp; 16k
      </text>

      <rect x={432} y={70} width={298} height={68} rx={8} strokeWidth="1.5" className="fill-canvas stroke-hairline" />
      <text x={446} y={92} className="fill-ink text-[11px] font-medium">
        HBM &middot; K and V blocks per layer
      </text>
      {Array.from({ length: 9 }, (_, i) => (
        <rect
          key={`hbm-${i}`}
          x={446 + i * 30}
          y={102}
          width={24}
          height={22}
          rx={3}
          className={i % 3 === 0 ? "fill-accent/25 stroke-accent/50" : "fill-info/20 stroke-info/40"}
          strokeWidth="1"
        />
      ))}

      <path d="M581 146V162" fill="none" strokeWidth="1.5" markerEnd="url(#kvtile-arrow)" className="stroke-body-mid" />
      <defs>
        <marker
          id="kvtile-arrow"
          viewBox="0 0 10 10"
          refX="8"
          refY="5"
          markerWidth="6"
          markerHeight="6"
          orient="auto"
        >
          <path d="M0 0 10 5 0 10z" className="fill-body-mid" />
        </marker>
      </defs>

      <rect x={432} y={170} width={298} height={116} rx={8} strokeWidth="1.5" className="fill-accent/5 stroke-accent/40" />
      <text x={446} y={190} className="fill-accent text-[11px] font-medium">
        SRAM &middot; one query tile at a time
      </text>
      <g>
        {TILE.map((r) =>
          TILE.map((c) => (
            <rect
              key={`tile-${r}-${c}`}
              x={450 + c * 17}
              y={200 + r * 17}
              width={15}
              height={15}
              rx={2}
              className={
                r === 3
                  ? "fill-warning/70"
                  : (r + c) % 3 === 0
                    ? "fill-accent/70"
                    : "fill-accent/25"
              }
            />
          )),
        )}
      </g>
      <text x={534} y={216} className="fill-body-mid text-[9px] font-mono">
        score tile S = Q&middot;K&#7488;
      </text>
      <text x={534} y={234} className="fill-body-mid text-[9px] font-mono">
        m = max(m, tile max)
      </text>
      <text x={534} y={252} className="fill-body-mid text-[9px] font-mono">
        l &larr; l&middot;exp(m&#8320; &minus; m) + &Sigma;exp
      </text>
      <text x={534} y={272} className="fill-warning text-[9px] font-mono">
        row 4: rescale O by l&#8320;/l
      </text>

      <g>
        {Array.from({ length: 25 }, (_, i) => (
          <rect
            key={`ghost-${i}`}
            x={678 + (i % 5) * 9}
            y={204 + Math.floor(i / 5) * 9}
            width={7.5}
            height={7.5}
            rx={1}
            className="fill-mute/10 stroke-mute/30"
            strokeWidth="0.75"
          />
        ))}
        <line x1={674} y1={252} x2={728} y2={202} strokeWidth="1.5" className="stroke-error" />
      </g>

      <path d="M581 286V304" fill="none" strokeWidth="1.5" markerEnd="url(#kvtile-arrow)" className="stroke-body-mid" />
      <rect x={432} y={312} width={298} height={44} rx={8} strokeWidth="1.5" className="fill-canvas stroke-hairline" />
      <text x={446} y={332} className="fill-ink text-[11px] font-medium">
        output tile written back to HBM
      </text>
      <text x={446} y={348} className="fill-error text-[9.5px] font-mono">
        the full n&times;n score matrix never exists in HBM
      </text>
    </svg>
  );
}
