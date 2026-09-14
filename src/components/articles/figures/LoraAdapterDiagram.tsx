const CELL = 24;

function Grid({
  x,
  y,
  rows,
  cols,
  className,
}: {
  x: number;
  y: number;
  rows: number;
  cols: number;
  className: string;
}) {
  return (
    <g>
      {Array.from({ length: rows }, (_, r) =>
        Array.from({ length: cols }, (_, c) => (
          <rect
            key={`${r}-${c}`}
            x={x + c * CELL}
            y={y + r * CELL}
            width={CELL}
            height={CELL}
            strokeWidth={1.5}
            className={className}
          />
        )),
      )}
    </g>
  );
}

const RANK_ERRORS = [0.31, 0.18, 0.09, 0.05, 0.02];
const RANK_VALUES = [4, 8, 16, 32, 64];
const ERROR_BASE = 344;
const ERROR_SCALE = 440;

export function LoraAdapterDiagram() {
  return (
    <svg
      viewBox="0 0 760 380"
      role="img"
      aria-labelledby="loraadapter-title loraadapter-desc"
      className="h-auto w-full"
    >
      <title id="loraadapter-title">
        Frozen weight plus a low-rank adapter and the merged result
      </title>
      <desc id="loraadapter-desc">
        Left: the frozen weight matrix W of shape d_out by d_in sits beside a
        narrow adapter, B of shape d_out by r times A of shape r by d_in, whose
        product is added to W. After merging, W plus BA is a single matrix, so
        serving sees no extra latency. Right: parameter arithmetic shows that
        for d equal to 4096 and r equal to 16, the adapter has 131 thousand
        parameters against 16.8 million dense ones, 0.78 percent, and a rank
        sweep shows relative approximation error falling as rank grows.
      </desc>

      <text x={24} y={26} className="fill-ink text-[12.5px] font-medium">
        Freeze the weight, train the elbow
      </text>
      <text x={24} y={42} className="fill-mute text-[9.5px] font-mono">
        &#916;W &#8776; B&#183;A &middot; B starts at zero, so training begins at the pretrained model
      </text>

      <text x={24} y={80} className="fill-ink text-[10px] font-medium">
        W &middot; d&#8345;&#8348;&#8348; &times; d&#7522;&#8345;
      </text>
      <Grid x={24} y={88} rows={4} cols={4} className="fill-canvas-soft stroke-hairline" />
      <text x={24} y={206} className="fill-mute text-[9px] font-mono">
        frozen &middot; no gradient
      </text>

      <text x={134} y={132} textAnchor="middle" className="fill-body-mid text-[14px] font-mono">
        +
      </text>
      <text x={148} y={80} className="fill-accent text-[10px] font-medium">
        B &middot; d&#8345;&#8348;&#8348; &times; r
      </text>
      <Grid x={148} y={88} rows={4} cols={2} className="fill-accent/15 stroke-accent/60" />

      <text x={208} y={132} textAnchor="middle" className="fill-body-mid text-[14px] font-mono">
        &middot;
      </text>
      <text x={222} y={80} className="fill-accent text-[10px] font-medium">
        A &middot; r &times; d&#7522;&#8345;
      </text>
      <Grid x={222} y={112} rows={2} cols={4} className="fill-accent/15 stroke-accent/60" />

      <text x={330} y={132} textAnchor="middle" className="fill-body-mid text-[14px] font-mono">
        =
      </text>
      <text x={346} y={80} className="fill-ink text-[10px] font-medium">
        W + BA
      </text>
      <Grid x={346} y={88} rows={4} cols={4} className="fill-accent/30 stroke-accent/70" />
      <text x={346} y={206} className="fill-accent text-[9px] font-mono">
        merged
      </text>

      <path d="M148 226H318" fill="none" strokeWidth={1.5} className="stroke-accent/60" />
      <path d="M148 222V230 M318 222V230" fill="none" strokeWidth={1.5} className="stroke-accent/60" />
      <text x={233} y={246} textAnchor="middle" className="fill-accent text-[9.5px] font-mono">
        r(d&#7522;&#8345; + d&#8345;&#8348;&#8348;) params
      </text>

      <path d="M462 60V340" fill="none" strokeWidth={1} className="stroke-hairline" />

      <text x={486} y={80} className="fill-ink text-[11px] font-medium">
        parameter math
      </text>
      <text x={486} y={104} className="fill-body-mid text-[9.5px] font-mono">
        d = 4096 &middot; r = 16
      </text>
      <text x={486} y={126} className="fill-body-mid text-[9.5px] font-mono">
        full: d&#178; = 16.8M
      </text>
      <text x={486} y={148} className="fill-accent text-[9.5px] font-mono">
        LoRA: r&middot;2d = 131K (0.78%)
      </text>
      <text x={486} y={170} className="fill-mute text-[9.5px] font-mono">
        gradients and Adam states shrink too
      </text>

      <text x={486} y={196} className="fill-ink text-[10px] font-medium">
        quality vs rank (relative error)
      </text>
      {RANK_ERRORS.map((error, i) => {
        const height = error * ERROR_SCALE;
        const x = 496 + i * 44;
        const active = RANK_VALUES[i] === 16;
        return (
          <g key={`rank-${RANK_VALUES[i]}`}>
            <rect
              x={x}
              y={ERROR_BASE - height}
              width={30}
              height={Math.max(2, height)}
              rx={2}
              strokeWidth={1.5}
              className={active ? "fill-accent/60 stroke-accent" : "fill-canvas-soft stroke-hairline"}
            />
            <text
              x={x + 15}
              y={ERROR_BASE + 15}
              textAnchor="middle"
              className={active ? "fill-accent text-[9px] font-mono" : "fill-mute text-[9px] font-mono"}
            >
              {RANK_VALUES[i]}
            </text>
          </g>
        );
      })}

      <text x={486} y={376} className="fill-body-mid text-[9.5px]">
        2026 defaults: r 8&ndash;16 &middot; &#945;/r &#8776; 2 &middot; all-linear targets
      </text>
    </svg>
  );
}
