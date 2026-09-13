function Bar({
  x,
  top,
  height,
  value,
  strong,
}: {
  x: number;
  top: number;
  height: number;
  value: string;
  strong?: boolean;
}) {
  return (
    <g>
      <rect
        x={x}
        y={top}
        width={44}
        height={height}
        rx={4}
        strokeWidth={1.5}
        className={
          strong ? "fill-accent/15 stroke-accent/50" : "fill-canvas-soft stroke-hairline"
        }
      />
      <text
        x={x + 22}
        y={top - 8}
        textAnchor="middle"
        className={
          strong
            ? "fill-accent text-[10px] font-mono"
            : "fill-body-mid text-[10px] font-mono"
        }
      >
        {value}
      </text>
    </g>
  );
}

export function BundleSplit() {
  return (
    <svg
      viewBox="0 0 760 340"
      role="img"
      aria-labelledby="bundle-title bundle-desc"
      className="h-auto w-full"
    >
      <title id="bundle-title">First-load JavaScript before and after the split</title>
      <desc id="bundle-desc">
        Gzip kilobytes per route: /about falls from 1490 to 183.2 and /problems
        from 1499 to 250.8 after the header data chain is broken. The home
        landing still ships the full problem bank at 1552.8.
      </desc>
      <rect x={80} y={22} width={12} height={12} rx={2} strokeWidth={1.5} className="fill-canvas-soft stroke-hairline" />
      <text x={98} y={32} className="fill-body-mid text-[10px]">
        before
      </text>
      <rect x={170} y={22} width={12} height={12} rx={2} strokeWidth={1.5} className="fill-accent/15 stroke-accent/50" />
      <text x={188} y={32} className="fill-body-mid text-[10px]">
        after
      </text>
      <rect
        x={260}
        y={22}
        width={12}
        height={12}
        rx={2}
        fill="none"
        strokeWidth={1.5}
        strokeDasharray="3 3"
        className="stroke-hairline"
      />
      <text x={278} y={32} className="fill-body-mid text-[10px]">
        still unsplit
      </text>
      <text
        x={720}
        y={32}
        textAnchor="end"
        className="fill-mute text-[10px] font-mono"
      >
        measure-bundle.ts · gzip kB, first load
      </text>

      {[
        ["1600", 70],
        ["1200", 120],
        ["800", 170],
        ["400", 220],
        ["0", 270],
      ].map(([label, y]) => (
        <g key={label}>
          <path
            d={`M80 ${y}H720`}
            fill="none"
            strokeWidth={1}
            className="stroke-hairline"
          />
          <text
            x={70}
            y={Number(y) + 3}
            textAnchor="end"
            className="fill-mute text-[9.5px] font-mono"
          >
            {label}
          </text>
        </g>
      ))}

      <Bar x={171} top={83.8} height={186.2} value="1490" />
      <Bar x={225} top={247.1} height={22.9} value="183.2" strong />
      <Bar x={391} top={82.6} height={187.4} value="1499" />
      <Bar x={445} top={238.7} height={31.3} value="250.8" strong />
      <rect
        x={618}
        y={75.9}
        width={44}
        height={194.1}
        rx={4}
        fill="none"
        strokeWidth={1.5}
        strokeDasharray="5 4"
        className="stroke-hairline"
      />
      <text
        x={640}
        y={67.9}
        textAnchor="middle"
        className="fill-body-mid text-[10px] font-mono"
      >
        1552.8
      </text>

      <text
        x={220}
        y={294}
        textAnchor="middle"
        className="fill-body text-[11px] font-mono"
      >
        /about
      </text>
      <text
        x={440}
        y={294}
        textAnchor="middle"
        className="fill-body text-[11px] font-mono"
      >
        /problems
      </text>
      <text
        x={640}
        y={294}
        textAnchor="middle"
        className="fill-body text-[11px] font-mono"
      >
        / (home)
      </text>

      <text
        x={220}
        y={312}
        textAnchor="middle"
        className="fill-accent text-[10px] font-mono"
      >
        −88%
      </text>
      <text
        x={440}
        y={312}
        textAnchor="middle"
        className="fill-accent text-[10px] font-mono"
      >
        −83%
      </text>
      <text
        x={640}
        y={312}
        textAnchor="middle"
        className="fill-warning text-[10px] font-mono"
      >
        full bank · next target
      </text>
    </svg>
  );
}
