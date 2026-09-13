function StepBox({
  x,
  y,
  width,
  title,
  sub,
}: {
  x: number;
  y: number;
  width: number;
  title: string;
  sub: string;
}) {
  return (
    <g>
      <rect
        x={x}
        y={y}
        width={width}
        height={60}
        rx={8}
        strokeWidth={1.5}
        className="fill-canvas stroke-hairline"
      />
      <text x={x + 20} y={y + 28} className="fill-ink text-[12.5px] font-medium">
        {title}
      </text>
      <text x={x + 20} y={y + 48} className="fill-body-mid text-[9.5px] font-mono">
        {sub}
      </text>
    </g>
  );
}

const INERTIA = [118, 96, 78, 70, 68, 68];
const CHART_X = [490, 532, 574, 616, 658, 700];

function chartY(value: number) {
  return 240 - value * 1.2;
}

export function KMeansLoop() {
  const stepPath = CHART_X.map(
    (x, i) => `${i === 0 ? `M482 ${chartY(INERTIA[0])}H${x}` : ""}V${chartY(INERTIA[i])}H${CHART_X[i + 1] ?? x}`,
  ).join("");

  return (
    <svg
      viewBox="0 0 760 320"
      role="img"
      aria-labelledby="kmeansloop-title kmeansloop-desc"
      className="h-auto w-full"
    >
      <title id="kmeansloop-title">
        The k-means loop and its decreasing inertia
      </title>
      <desc id="kmeansloop-desc">
        A loop diagram: assign every point to its nearest centroid, recompute
        each centroid as the mean of its cluster, and repeat until assignments
        stop changing. An inset step chart shows inertia falling over six
        iterations and then flattening; it never rises.
      </desc>
      <defs>
        <marker
          id="kmeansloop-arrow"
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

      <StepBox x={40} y={70} width={210} title="Assign" sub="each point → nearest centroid" />
      <StepBox x={290} y={70} width={210} title="Recompute" sub="centroid ← mean of cluster" />
      <StepBox x={155} y={200} width={230} title="Repeat" sub="until assignments stop changing" />

      <path
        d="M250 100H281"
        fill="none"
        strokeWidth={1.5}
        markerEnd="url(#kmeansloop-arrow)"
        className="stroke-body-mid"
      />
      <path
        d="M395 130V160Q395 170 385 170H360Q350 170 350 180V193"
        fill="none"
        strokeWidth={1.5}
        markerEnd="url(#kmeansloop-arrow)"
        className="stroke-body-mid"
      />
      <path
        d="M155 230H120Q110 230 110 218V137"
        fill="none"
        strokeWidth={1.5}
        markerEnd="url(#kmeansloop-arrow)"
        className="stroke-body-mid"
      />
      <text x={116} y={184} className="fill-body-mid text-[9.5px] font-mono">
        repeat
      </text>

      <text x={470} y={44} className="fill-ink text-[12px] font-medium">
        Inertia per iteration
      </text>
      <text x={470} y={58} className="fill-body-mid text-[9.5px] font-mono">
        Σ squared distance to assigned centroid
      </text>
      <text x={480} y={88} className="fill-mute text-[9px] font-mono">
        inertia
      </text>
      <path d="M480 96V240H720" fill="none" strokeWidth={1} className="stroke-hairline" />

      <path d={stepPath} fill="none" strokeWidth={1.5} className="stroke-accent" />
      {CHART_X.map((x, i) => (
        <g key={x}>
          <path
            d={`M${x} 240V246`}
            fill="none"
            strokeWidth={1}
            className="stroke-hairline"
          />
          <text
            x={x}
            y={258}
            textAnchor="middle"
            className="fill-mute text-[9px] font-mono"
          >
            {i}
          </text>
          <circle cx={x} cy={chartY(INERTIA[i])} r={2.5} className="fill-accent" />
        </g>
      ))}
      <text x={480} y={276} className="fill-mute text-[9px] font-mono">
        iteration
      </text>
      <text
        x={700}
        y={150}
        textAnchor="end"
        className="fill-body-mid text-[9px] font-mono"
      >
        flat = converged
      </text>
      <text x={470} y={300} className="fill-accent text-[10.5px]">
        inertia only decreases
      </text>

      <circle cx={40} cy={308} r={3} className="fill-accent" />
      <text x={50} y={312} className="fill-accent text-[10.5px]">
        Every full pass weakly lowers the objective — the loop can only stop, never climb.
      </text>
    </svg>
  );
}
