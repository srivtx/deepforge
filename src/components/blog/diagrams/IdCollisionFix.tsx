function Face({ cx, cy }: { cx: number; cy: number }) {
  return (
    <g>
      <circle
        cx={cx}
        cy={cy}
        r={32}
        strokeWidth={1.5}
        className="fill-canvas-soft stroke-body-mid"
      />
      <circle cx={cx - 10} cy={cy - 6} r={2.4} className="fill-body-mid" />
      <circle cx={cx + 10} cy={cy - 6} r={2.4} className="fill-body-mid" />
      <path
        d={`M${cx - 9} ${cy + 9}Q${cx} ${cy + 15} ${cx + 9} ${cy + 9}`}
        fill="none"
        strokeWidth={1.5}
        strokeLinecap="round"
        className="stroke-body-mid"
      />
    </g>
  );
}

export function IdCollisionFix() {
  return (
    <svg
      viewBox="0 0 760 340"
      role="img"
      aria-labelledby="idcollision-title idcollision-desc"
      className="h-auto w-full"
    >
      <title id="idcollision-title">SVG definition id collision and the uid fix</title>
      <desc id="idcollision-desc">
        Left: two avatars on one page both reference the id hd-macaque-base, and
        the browser resolves it to the first definition in the document, so the
        second avatar borrows the first avatar&apos;s gradient and clip. Right:
        every definition id carries a per-seed uid suffix, so each avatar
        resolves to its own defs and a seed renders identically everywhere.
      </desc>
      <defs>
        <pattern
          id="idcollision-grid"
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
          id="idcollision-arrow-warn"
          viewBox="0 0 10 10"
          refX="8"
          refY="5"
          markerWidth="6"
          markerHeight="6"
          orient="auto"
        >
          <path d="M0 0 10 5 0 10z" className="fill-warning" />
        </marker>
        <marker
          id="idcollision-arrow-accent"
          viewBox="0 0 10 10"
          refX="8"
          refY="5"
          markerWidth="6"
          markerHeight="6"
          orient="auto"
        >
          <path d="M0 0 10 5 0 10z" className="fill-accent" />
        </marker>
      </defs>

      <rect width="760" height="340" fill="url(#idcollision-grid)" />

      <text x="40" y="28" className="fill-mute text-[10px] font-mono">
        one document · two avatars · both rolled the macaque head
      </text>
      <text
        x="720"
        y="28"
        textAnchor="end"
        className="fill-mute text-[10px] font-mono"
      >
        src/components/avatars/NftAvatarArt.tsx
      </text>

      <rect
        x={40}
        y={48}
        width={320}
        height={232}
        rx={8}
        strokeWidth={1.5}
        className="fill-canvas stroke-hairline"
      />
      <text x={60} y={78} className="fill-warning text-[11.5px] font-medium">
        bug — shared def ids
      </text>
      <text x={60} y={96} className="fill-body-mid text-[9.5px] font-mono">
        url(#hd-macaque-base)
      </text>

      <Face cx={140} cy={160} />
      <Face cx={270} cy={160} />
      <text
        x={140}
        y={120}
        textAnchor="middle"
        className="fill-mute text-[9.5px] font-mono"
      >
        seed nova_7f3a
      </text>
      <text
        x={270}
        y={120}
        textAnchor="middle"
        className="fill-mute text-[9.5px] font-mono"
      >
        seed sol_9c21
      </text>

      <rect
        x={90}
        y={224}
        width={230}
        height={44}
        rx={6}
        strokeWidth={1.5}
        className="fill-warning/5 stroke-warning/40"
      />
      <text
        x={205}
        y={243}
        textAnchor="middle"
        className="fill-warning text-[10px] font-mono"
      >
        hd-macaque-base
      </text>
      <text
        x={205}
        y={258}
        textAnchor="middle"
        className="fill-body-mid text-[9px] font-mono"
      >
        gradient · clip — first match wins
      </text>
      <path
        d="M140 192V216"
        fill="none"
        strokeWidth={1.5}
        markerEnd="url(#idcollision-arrow-warn)"
        className="stroke-warning"
      />
      <path
        d="M270 192V216"
        fill="none"
        strokeWidth={1.5}
        markerEnd="url(#idcollision-arrow-warn)"
        className="stroke-warning"
      />

      <rect
        x={400}
        y={48}
        width={320}
        height={232}
        rx={8}
        strokeWidth={1.5}
        className="fill-canvas stroke-hairline"
      />
      <text x={420} y={78} className="fill-accent text-[11.5px] font-medium">
        fix — uid-suffixed defs
      </text>
      <text x={420} y={96} className="fill-body-mid text-[9.5px] font-mono">
        url(#hd-macaque-base-&#123;uid&#125;)
      </text>

      <Face cx={480} cy={160} />
      <Face cx={610} cy={160} />
      <text
        x={480}
        y={120}
        textAnchor="middle"
        className="fill-mute text-[9.5px] font-mono"
      >
        seed nova_7f3a
      </text>
      <text
        x={610}
        y={120}
        textAnchor="middle"
        className="fill-mute text-[9.5px] font-mono"
      >
        seed sol_9c21
      </text>

      <rect
        x={422}
        y={224}
        width={134}
        height={44}
        rx={6}
        strokeWidth={1.5}
        className="fill-accent/5 stroke-accent/40"
      />
      <text
        x={489}
        y={243}
        textAnchor="middle"
        className="fill-body-mid text-[9px] font-mono"
      >
        hd-macaque-base
      </text>
      <text
        x={489}
        y={258}
        textAnchor="middle"
        className="fill-accent text-[9px] font-mono"
      >
        -nova_7f3a
      </text>

      <rect
        x={566}
        y={224}
        width={134}
        height={44}
        rx={6}
        strokeWidth={1.5}
        className="fill-accent/5 stroke-accent/40"
      />
      <text
        x={633}
        y={243}
        textAnchor="middle"
        className="fill-body-mid text-[9px] font-mono"
      >
        hd-macaque-base
      </text>
      <text
        x={633}
        y={258}
        textAnchor="middle"
        className="fill-accent text-[9px] font-mono"
      >
        -sol_9c21
      </text>
      <path
        d="M480 192V216"
        fill="none"
        strokeWidth={1.5}
        markerEnd="url(#idcollision-arrow-accent)"
        className="stroke-accent"
      />
      <path
        d="M610 192V216"
        fill="none"
        strokeWidth={1.5}
        markerEnd="url(#idcollision-arrow-accent)"
        className="stroke-accent"
      />

      <text
        x="380"
        y="320"
        textAnchor="middle"
        className="fill-accent text-[10.5px]"
      >
        one id per seed — the same seed always resolves to the same defs
      </text>
    </svg>
  );
}
