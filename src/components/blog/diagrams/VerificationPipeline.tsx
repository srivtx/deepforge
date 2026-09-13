function Stage({
  x,
  y,
  title,
  sub,
  accent,
}: {
  x: number;
  y: number;
  title: string;
  sub: string;
  accent?: boolean;
}) {
  return (
    <g>
      <rect
        x={x}
        y={y}
        width={200}
        height={68}
        rx={8}
        strokeWidth={1.5}
        className={
          accent ? "fill-accent/5 stroke-accent/40" : "fill-canvas stroke-hairline"
        }
      />
      <text
        x={x + 20}
        y={y + 30}
        className={accent ? "fill-accent text-[13px] font-medium" : "fill-ink text-[13px] font-medium"}
      >
        {title}
      </text>
      <text x={x + 20} y={y + 50} className="fill-body-mid text-[10px] font-mono">
        {sub}
      </text>
    </g>
  );
}

export function VerificationPipeline() {
  return (
    <svg
      viewBox="0 0 760 340"
      role="img"
      aria-labelledby="vpipeline-title vpipeline-desc"
      className="h-auto w-full"
    >
      <title id="vpipeline-title">Problem verification pipeline</title>
      <desc id="vpipeline-desc">
        A generated problem passes structural validation, runs in real CPython,
        is checked for 1e-6 deep equality, then is committed and published.
        Structural and runtime failures loop back to the author.
      </desc>
      <defs>
        <pattern
          id="vpipeline-grid"
          width="24"
          height="24"
          patternUnits="userSpaceOnUse"
        >
          <path
            d="M24 0H0V24"
            fill="none"
            strokeWidth="1"
            opacity="0.55"
            className="stroke-hairline"
          />
        </pattern>
        <marker
          id="vpipeline-arrow"
          viewBox="0 0 10 10"
          refX="8"
          refY="5"
          markerWidth="6"
          markerHeight="6"
          orient="auto"
        >
          <path d="M0 0 10 5 0 10z" className="fill-body-mid" />
        </marker>
        <marker
          id="vpipeline-arrow-warn"
          viewBox="0 0 10 10"
          refX="8"
          refY="5"
          markerWidth="6"
          markerHeight="6"
          orient="auto"
        >
          <path d="M0 0 10 5 0 10z" className="fill-warning" />
        </marker>
      </defs>

      <rect width="760" height="340" fill="url(#vpipeline-grid)" />

      <text x="40" y="30" className="fill-mute text-[10px] font-mono">
        bun run scripts/verify-problems.ts
      </text>
      <text
        x="720"
        y="30"
        textAnchor="end"
        className="fill-mute text-[10px] font-mono"
      >
        15 categories · 21,165 cases
      </text>

      <Stage x={40} y={100} title="Generated problem" sub="part-NN.ts · id assigned" />
      <Stage x={280} y={100} title="Structural pass" sub="ids · fields · 3–5 cases" />
      <Stage x={520} y={100} title="CPython run" sub="py_verify.py · exec()" />
      <Stage x={520} y={220} title="Equality check" sub="deep eq · rel/abs 1e-6" />
      <Stage x={280} y={220} title="Seed & commit" sub="unique id · part index" />
      <Stage x={40} y={220} title="5,050 published" sub="ALL GREEN · 15 categories" accent />

      <path
        d="M240 134H272"
        fill="none"
        strokeWidth={1.5}
        markerEnd="url(#vpipeline-arrow)"
        className="stroke-body-mid"
      />
      <path
        d="M480 134H512"
        fill="none"
        strokeWidth={1.5}
        markerEnd="url(#vpipeline-arrow)"
        className="stroke-body-mid"
      />
      <path
        d="M620 168V212"
        fill="none"
        strokeWidth={1.5}
        markerEnd="url(#vpipeline-arrow)"
        className="stroke-body-mid"
      />
      <path
        d="M520 254H488"
        fill="none"
        strokeWidth={1.5}
        markerEnd="url(#vpipeline-arrow)"
        className="stroke-body-mid"
      />
      <path
        d="M280 254H248"
        fill="none"
        strokeWidth={1.5}
        markerEnd="url(#vpipeline-arrow)"
        className="stroke-body-mid"
      />

      <path
        d="M380 100C380 48 140 48 140 100"
        fill="none"
        strokeWidth={1.5}
        strokeDasharray="5 5"
        markerEnd="url(#vpipeline-arrow-warn)"
        className="stroke-warning"
      />
      <text
        x="260"
        y="40"
        textAnchor="middle"
        className="fill-warning text-[10px] font-mono"
      >
        structural errors
      </text>

      <path
        d="M720 244H736V116H728"
        fill="none"
        strokeWidth={1.5}
        strokeDasharray="5 5"
        markerEnd="url(#vpipeline-arrow-warn)"
        className="stroke-warning"
      />
      <text
        x="754"
        y="184"
        textAnchor="middle"
        transform="rotate(-90 754 184)"
        className="fill-warning text-[10px] font-mono"
      >
        tolerance miss
      </text>

      <text
        x="720"
        y="322"
        textAnchor="end"
        className="fill-mute text-[10px] font-mono"
      >
        5,050 solutions · under a second
      </text>
    </svg>
  );
}
