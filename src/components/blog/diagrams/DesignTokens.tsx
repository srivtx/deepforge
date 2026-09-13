function Swatch({
  x,
  y,
  fill,
  name,
}: {
  x: number;
  y: number;
  fill: string;
  name: string;
}) {
  return (
    <g>
      <rect
        x={x}
        y={y}
        width={32}
        height={32}
        rx={6}
        strokeWidth={1.5}
        className={`${fill} stroke-hairline`}
      />
      <text x={x} y={y + 44} className="fill-mute text-[8.5px] font-mono">
        {name}
      </text>
    </g>
  );
}

export function DesignTokens() {
  return (
    <svg
      viewBox="0 0 760 280"
      role="img"
      aria-labelledby="tokens-title tokens-desc"
      className="h-auto w-full"
    >
      <title id="tokens-title">Design tokens</title>
      <desc id="tokens-desc">
        One palette, one type scale, one radius, two motion bands. Colors render
        from the live CSS variables so the diagram flips with the theme.
      </desc>

      <path
        d="M280 40V244"
        fill="none"
        strokeWidth={1}
        className="stroke-hairline"
      />
      <path
        d="M520 40V244"
        fill="none"
        strokeWidth={1}
        className="stroke-hairline"
      />

      <text x={30} y={64} className="fill-body-mid text-[11px] font-medium">
        Color
      </text>
      <Swatch x={30} y={90} fill="fill-[var(--canvas)]" name="canvas" />
      <Swatch x={88} y={90} fill="fill-canvas-card" name="canvas-card" />
      <Swatch x={146} y={90} fill="fill-canvas-soft" name="canvas-soft" />
      <Swatch x={30} y={150} fill="fill-[var(--canvas-mid)]" name="canvas-mid" />
      <Swatch x={88} y={150} fill="fill-body-mid" name="body-mid" />
      <Swatch x={146} y={150} fill="fill-ink" name="ink" />
      <Swatch x={204} y={150} fill="fill-accent" name="accent" />
      <text x={30} y={232} className="fill-mute text-[9px] font-mono">
        light values flip via :root.light
      </text>

      <text x={300} y={64} className="fill-body-mid text-[11px] font-medium">
        Type scale
      </text>
      <text x={300} y={112} className="fill-ink text-[26px] font-semibold">
        Forge
      </text>
      <text
        x={510}
        y={110}
        textAnchor="end"
        className="fill-mute text-[9px] font-mono"
      >
        title 30 / 600
      </text>
      <text x={300} y={152} className="fill-ink text-[17px] font-semibold">
        Forge
      </text>
      <text
        x={510}
        y={150}
        textAnchor="end"
        className="fill-mute text-[9px] font-mono"
      >
        section 18 / 600
      </text>
      <text x={300} y={184} className="fill-body text-[14px]">
        Forge your ML
      </text>
      <text
        x={510}
        y={182}
        textAnchor="end"
        className="fill-mute text-[9px] font-mono"
      >
        body 14 / 400
      </text>
      <text x={300} y={214} className="fill-body-mid text-[12px]">
        12 min read
      </text>
      <text
        x={510}
        y={212}
        textAnchor="end"
        className="fill-mute text-[9px] font-mono"
      >
        meta 12 / 400
      </text>
      <text x={300} y={244} className="fill-mute text-[9px] font-mono">
        Inter · JetBrains Mono for ids
      </text>

      <text x={540} y={64} className="fill-body-mid text-[11px] font-medium">
        Shape &amp; motion
      </text>
      <rect
        x={540}
        y={86}
        width={52}
        height={52}
        rx={8}
        strokeWidth={1.5}
        className="fill-canvas stroke-hairline"
      />
      <text x={604} y={108} className="fill-ink text-[11px] font-medium">
        radius 8px
      </text>
      <text x={604} y={124} className="fill-mute text-[9px] font-mono">
        one corner for all
      </text>
      <rect
        x={540}
        y={154}
        width={50}
        height={8}
        rx={4}
        className="fill-accent/60"
      />
      <text x={600} y={162} className="fill-body-mid text-[9px] font-mono">
        150–250ms micro
      </text>
      <rect
        x={540}
        y={180}
        width={110}
        height={8}
        rx={4}
        className="fill-info/60"
      />
      <text x={658} y={188} className="fill-body-mid text-[9px] font-mono">
        400–600ms reveal
      </text>
      <text x={540} y={222} className="fill-mute text-[9px] font-mono">
        transform + opacity only
      </text>
      <text x={540} y={238} className="fill-mute text-[9px] font-mono">
        reduced-motion snaps
      </text>
    </svg>
  );
}
