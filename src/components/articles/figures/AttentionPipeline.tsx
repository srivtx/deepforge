function Stage({
  x,
  y,
  width,
  title,
  sub,
  accent,
}: {
  x: number;
  y: number;
  width: number;
  title: string;
  sub: string;
  accent?: boolean;
}) {
  return (
    <g>
      <rect
        x={x}
        y={y}
        width={width}
        height={58}
        rx={8}
        strokeWidth={1.5}
        className={accent ? "fill-accent/5 stroke-accent/40" : "fill-canvas stroke-hairline"}
      />
      <text
        x={x + 16}
        y={y + 25}
        className={
          accent
            ? "fill-accent text-[12px] font-medium"
            : "fill-ink text-[12px] font-medium"
        }
      >
        {title}
      </text>
      <text x={x + 16} y={y + 44} className="fill-body-mid text-[9.5px] font-mono">
        {sub}
      </text>
    </g>
  );
}

export function AttentionPipeline() {
  return (
    <svg
      viewBox="0 0 760 340"
      role="img"
      aria-labelledby="attnpipe-title attnpipe-desc"
      className="h-auto w-full"
    >
      <title id="attnpipe-title">Scaled dot-product attention pipeline</title>
      <desc id="attnpipe-desc">
        A pipeline: input tokens are projected into queries, keys, and values.
        Queries and keys produce an n by n score matrix, which is divided by the
        square root of the key dimension and softmaxed one row at a time. The
        resulting weights multiply the values into one output vector per token.
      </desc>
      <defs>
        <marker
          id="attnpipe-arrow"
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

      <text x={30} y={34} className="fill-mute text-[10px] font-mono">
        scaled dot-product attention · one head
      </text>
      <text x={730} y={34} textAnchor="end" className="fill-mute text-[10px] font-mono">
        d_k = dimension of one key
      </text>

      <Stage x={30} y={64} width={130} title="input tokens" sub="x₁ … xₙ" />
      <Stage x={203} y={64} width={150} title="Q · K · V" sub="x·W_Q x·W_K x·W_V" />
      <Stage x={396} y={64} width={140} title="S = Q·Kᵀ" sub="n×n dot products" />
      <Stage x={579} y={64} width={150} title="S / √d_k" sub="keeps scores sane" />
      <Stage x={579} y={188} width={150} title="row softmax" sub="every row sums to 1" />
      <Stage x={370} y={188} width={160} title="output = A·V" sub="weighted average" />
      <Stage x={90} y={188} width={230} title="output tokens" sub="y₁ … yₙ · same dim as v" accent />

      <path
        d="M160 93H195"
        fill="none"
        strokeWidth={1.5}
        markerEnd="url(#attnpipe-arrow)"
        className="stroke-body-mid"
      />
      <path
        d="M353 93H388"
        fill="none"
        strokeWidth={1.5}
        markerEnd="url(#attnpipe-arrow)"
        className="stroke-body-mid"
      />
      <path
        d="M536 93H571"
        fill="none"
        strokeWidth={1.5}
        markerEnd="url(#attnpipe-arrow)"
        className="stroke-body-mid"
      />
      <path
        d="M654 122V180"
        fill="none"
        strokeWidth={1.5}
        markerEnd="url(#attnpipe-arrow)"
        className="stroke-body-mid"
      />
      <path
        d="M579 217H538"
        fill="none"
        strokeWidth={1.5}
        markerEnd="url(#attnpipe-arrow)"
        className="stroke-body-mid"
      />
      <path
        d="M370 217H328"
        fill="none"
        strokeWidth={1.5}
        markerEnd="url(#attnpipe-arrow)"
        className="stroke-body-mid"
      />
      <path
        d="M278 122V152Q278 160 286 160H442Q450 160 450 168V180"
        fill="none"
        strokeWidth={1.5}
        markerEnd="url(#attnpipe-arrow)"
        className="stroke-body-mid"
      />
      <text
        x={360}
        y={152}
        textAnchor="middle"
        className="fill-body-mid text-[9.5px] font-mono"
      >
        V
      </text>

      <text x={30} y={296} className="fill-accent text-[11px] font-mono">
        softmax(Q·Kᵀ / √d_k) · V
      </text>
      <text x={30} y={314} className="fill-body-mid text-[10px]">
        every token leaves as a weighted mixture of the values it selected
      </text>
    </svg>
  );
}
