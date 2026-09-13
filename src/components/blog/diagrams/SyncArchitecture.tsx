function StoreItem({ x, y, label }: { x: number; y: number; label: string }) {
  return (
    <text x={x} y={y} className="fill-body text-[10px] font-mono">
      {label}
    </text>
  );
}

function SupabaseRow({
  x,
  y,
  title,
  sub,
}: {
  x: number;
  y: number;
  title: string;
  sub: string;
}) {
  return (
    <g>
      <text x={x} y={y} className="fill-ink text-[12px] font-medium">
        {title}
      </text>
      <text x={x} y={y + 18} className="fill-body-mid text-[10px] font-mono">
        {sub}
      </text>
    </g>
  );
}

export function SyncArchitecture() {
  return (
    <svg
      viewBox="0 0 760 360"
      role="img"
      aria-labelledby="syncarch-title syncarch-desc"
      className="h-auto w-full"
    >
      <title id="syncarch-title">Offline-first sync architecture</title>
      <desc id="syncarch-desc">
        Nine browser stores write synchronously to localStorage through a thin
        adapter. A debounced flush pushes to the optional Supabase backend,
        where user_stores and user_stats live behind row level security.
        Pulls merge through per-store rules. Reads never wait on the network.
      </desc>
      <defs>
        <marker
          id="syncarch-arrow"
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

      <text x="40" y="30" className="fill-mute text-[10px] font-mono">
        store.ts · localAdapter.ts · remoteMerge.ts · remote.ts
      </text>

      <g>
        <rect
          x={30}
          y={52}
          width={480}
          height={250}
          rx={12}
          fill="none"
          strokeWidth={1.5}
          className="stroke-hairline"
        />
        <text x={48} y={76} className="fill-ink text-[12px] font-medium">
          This browser — always local
        </text>

        <rect
          x={50}
          y={96}
          width={132}
          height={186}
          rx={8}
          strokeWidth={1.5}
          className="fill-canvas stroke-hairline"
        />
        <text x={64} y={120} className="fill-ink text-[12px] font-medium">
          9 stores
        </text>
        <StoreItem x={64} y={146} label="progress" />
        <StoreItem x={64} y={164} label="daily" />
        <StoreItem x={64} y={182} label="collections" />
        <StoreItem x={64} y={200} label="contests" />
        <StoreItem x={64} y={218} label="interview" />
        <text x={64} y={244} className="fill-body-mid text-[10px] font-mono">
          + 4 more
        </text>
        <text x={64} y={268} className="fill-mute text-[10px] font-mono">
          localStorage
        </text>

        <rect
          x={202}
          y={96}
          width={132}
          height={186}
          rx={8}
          strokeWidth={1.5}
          className="fill-canvas stroke-hairline"
        />
        <text x={216} y={120} className="fill-ink text-[12px] font-medium">
          Adapter
        </text>
        <StoreItem x={216} y={146} label="get() — sync" />
        <StoreItem x={216} y={164} label="set() + event" />
        <StoreItem x={216} y={182} label="notifyLocalWrite" />
        <StoreItem x={216} y={200} label="~1.5s debounce" />
        <StoreItem x={216} y={218} label="flush on pagehide" />
        <text x={216} y={268} className="fill-mute text-[10px] font-mono">
          localAdapter.ts
        </text>

        <rect
          x={354}
          y={96}
          width={132}
          height={186}
          rx={8}
          strokeWidth={1.5}
          className="fill-canvas stroke-hairline"
        />
        <text x={368} y={120} className="fill-ink text-[12px] font-medium">
          Merge layer
        </text>
        <StoreItem x={368} y={146} label="sticky flags" />
        <StoreItem x={368} y={164} label="earliest solve" />
        <StoreItem x={368} y={182} label="union dates" />
        <StoreItem x={368} y={200} label="savedCode LWW" />
        <StoreItem x={368} y={218} label="+ 5 more rules" />
        <text x={368} y={268} className="fill-mute text-[10px] font-mono">
          remoteMerge.ts
        </text>

        <path
          d="M182 189H194"
          fill="none"
          strokeWidth={1.5}
          markerEnd="url(#syncarch-arrow)"
          className="stroke-body-mid"
        />
        <path
          d="M334 189H346"
          fill="none"
          strokeWidth={1.5}
          markerEnd="url(#syncarch-arrow)"
          className="stroke-body-mid"
        />

        <circle cx={42} cy={318} r={3} className="fill-accent" />
        <text x={52} y={322} className="fill-accent text-[10.5px]">
          offline-first — the write path never awaits the network
        </text>
      </g>

      <g>
        <rect
          x={550}
          y={52}
          width={180}
          height={286}
          rx={12}
          fill="none"
          strokeWidth={1.5}
          strokeDasharray="6 5"
          className="stroke-hairline"
        />
        <text x={568} y={76} className="fill-ink text-[12px] font-medium">
          Supabase (optional)
        </text>
        <SupabaseRow x={568} y={108} title="user_stores" sub="JSONB · 1 row/store" />
        <SupabaseRow x={568} y={156} title="user_stats" sub="score · solved · streak" />
        <SupabaseRow x={568} y={204} title="RLS" sub="auth.uid() = user_id" />
        <SupabaseRow x={568} y={252} title="auth" sub="magic link + Google" />
        <SupabaseRow x={568} y={300} title="leaderboard" sub="security_invoker view" />

        <path
          d="M486 150H542"
          fill="none"
          strokeWidth={1.5}
          markerEnd="url(#syncarch-arrow)"
          className="stroke-body-mid"
        />
        <path
          d="M542 170H492"
          fill="none"
          strokeWidth={1.5}
          markerEnd="url(#syncarch-arrow)"
          className="stroke-body-mid"
        />
        <text
          x={514}
          y={140}
          textAnchor="middle"
          className="fill-body-mid text-[9.5px] font-mono"
        >
          push
        </text>
        <text
          x={514}
          y={188}
          textAnchor="middle"
          className="fill-body-mid text-[9.5px] font-mono"
        >
          pull + merge
        </text>
        <text
          x={514}
          y={212}
          textAnchor="middle"
          className="fill-mute text-[9px] font-mono"
        >
          session required
        </text>
      </g>
    </svg>
  );
}
