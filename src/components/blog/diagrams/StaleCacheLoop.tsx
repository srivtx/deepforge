function CycleNode({
  x,
  title,
  sub,
  warn,
}: {
  x: number;
  title: string;
  sub: string;
  warn?: boolean;
}) {
  return (
    <g>
      <rect
        x={x}
        y={56}
        width={200}
        height={58}
        rx={8}
        strokeWidth={1.5}
        className={
          warn
            ? "fill-warning/5 stroke-warning/40"
            : "fill-canvas stroke-hairline"
        }
      />
      <text
        x={x + 18}
        y={84}
        className={
          warn
            ? "fill-warning text-[12px] font-medium"
            : "fill-ink text-[12px] font-medium"
        }
      >
        {title}
      </text>
      <text
        x={x + 18}
        y={102}
        className="fill-body-mid text-[9.5px] font-mono"
      >
        {sub}
      </text>
    </g>
  );
}

export function StaleCacheLoop() {
  return (
    <svg
      viewBox="0 0 760 340"
      role="img"
      aria-labelledby="stalecache-title stalecache-desc"
      className="h-auto w-full"
    >
      <title id="stalecache-title">The stale-cache loop and the inline escape hatch</title>
      <desc id="stalecache-desc">
        The service worker serves the old bundle cache-first on localhost. The
        self-heal code that would clear the cache lives inside that old bundle,
        so it can never run — only a hard refresh shows the new build. The
        escape is an inline script in the server HTML, which is always fresh:
        it unregisters the worker, deletes deepforge caches, and reloads once.
      </desc>
      <defs>
        <pattern
          id="stalecache-grid"
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
          id="stalecache-arrow"
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
          id="stalecache-arrow-warn"
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
          id="stalecache-arrow-accent"
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

      <rect width="760" height="340" fill="url(#stalecache-grid)" />

      <text x="40" y="28" className="fill-warning text-[10px] font-mono">
        localhost only
      </text>
      <text
        x="720"
        y="28"
        textAnchor="end"
        className="fill-mute text-[10px] font-mono"
      >
        public/sw.js · VERSION v2
      </text>

      <CycleNode x={40} title="1 · load the page" sub="/_next/static/... chunk" />
      <CycleNode x={280} title="2 · cache-first hit" sub="old CSS + JS bundle" />
      <CycleNode
        x={520}
        title="3 · self-heal runs?"
        sub="it lives inside the bundle"
        warn
      />

      <path
        d="M240 85H272"
        fill="none"
        strokeWidth={1.5}
        markerEnd="url(#stalecache-arrow)"
        className="stroke-body-mid"
      />
      <path
        d="M480 85H512"
        fill="none"
        strokeWidth={1.5}
        markerEnd="url(#stalecache-arrow)"
        className="stroke-body-mid"
      />

      <path
        d="M620 114V136Q620 144 612 144H132Q124 144 124 136V122"
        fill="none"
        strokeWidth={1.5}
        strokeDasharray="5 5"
        markerEnd="url(#stalecache-arrow-warn)"
        className="stroke-warning"
      />
      <text
        x="380"
        y="138"
        textAnchor="middle"
        className="fill-warning text-[10px] font-mono"
      >
        the fix is cached inside the bug — no path out
      </text>

      <rect
        x={40}
        y={190}
        width={680}
        height={112}
        rx={8}
        strokeWidth={1.5}
        className="fill-accent/5 stroke-accent/40"
      />
      <text
        x="60"
        y="216"
        className="fill-accent text-[12px] font-medium"
      >
        escape hatch — inline script in the server HTML
      </text>
      <text
        x="700"
        y="216"
        textAnchor="end"
        className="fill-mute text-[9.5px] font-mono"
      >
        src/app/layout.tsx
      </text>

      <text x="60" y="246" className="fill-body text-[10px] font-mono">
        1 · unregister the worker
      </text>
      <text x="300" y="246" className="fill-body text-[10px] font-mono">
        2 · delete deepforge-* caches
      </text>
      <text x="540" y="246" className="fill-body text-[10px] font-mono">
        3 · reload once (session guard)
      </text>

      <path
        d="M60 260H700"
        fill="none"
        strokeWidth={1}
        className="stroke-hairline"
      />
      <text x="60" y="282" className="fill-body-mid text-[9.5px]">
        Always fresh: navigations are network-first, so the hatch is never served from the cache.
      </text>
      <text x="60" y="297" className="fill-body-mid text-[9.5px]">
        sw.js v2 refuses to cache on localhost at all — the hatch only helps browsers already poisoned.
      </text>

      <path
        d="M140 190V126"
        fill="none"
        strokeWidth={1.5}
        markerEnd="url(#stalecache-arrow-accent)"
        className="stroke-accent"
      />
      <text x="152" y="170" className="fill-accent text-[10px]">
        breaks the loop
      </text>

      <text
        x="720"
        y="328"
        textAnchor="end"
        className="fill-mute text-[9.5px] font-mono"
      >
        symptom: hard refresh “fixed” it — until the next reload
      </text>
    </svg>
  );
}
