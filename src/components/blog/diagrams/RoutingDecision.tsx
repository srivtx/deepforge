export function RoutingDecision() {
  return (
    <svg
      viewBox="0 0 760 340"
      role="img"
      aria-labelledby="routing-title routing-desc"
      className="h-auto w-full"
    >
      <title id="routing-title">Modal versus page decision tree</title>
      <desc id="routing-desc">
        Transient surfaces that disappear when the user is done stay overlays:
        the command palette, the assistant, and the sync panel. Sustained
        surfaces that deserve a URL become routes: practice problems, learning
        paths, labs, and every other destination.
      </desc>
      <defs>
        <marker
          id="routing-arrow"
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

      <rect
        x={270}
        y={24}
        width={220}
        height={48}
        rx={8}
        strokeWidth={1.5}
        className="fill-canvas stroke-hairline"
      />
      <text
        x={380}
        y={53}
        textAnchor="middle"
        className="fill-ink text-[12.5px] font-medium"
      >
        Where should this UI live?
      </text>

      <path
        d="M380 72V88Q380 95 373 95H207Q200 95 200 102V117"
        fill="none"
        strokeWidth={1.5}
        markerEnd="url(#routing-arrow)"
        className="stroke-body-mid"
      />
      <path
        d="M380 72V88Q380 95 387 95H553Q560 95 560 102V117"
        fill="none"
        strokeWidth={1.5}
        markerEnd="url(#routing-arrow)"
        className="stroke-body-mid"
      />

      <rect
        x={50}
        y={118}
        width={300}
        height={64}
        rx={8}
        strokeWidth={1.5}
        className="fill-canvas stroke-hairline"
      />
      <text x={70} y={146} className="fill-ink text-[12.5px] font-medium">
        Transient — gone when done?
      </text>
      <text x={70} y={166} className="fill-body-mid text-[10.5px]">
        palette · assistant · sync status
      </text>

      <rect
        x={410}
        y={118}
        width={300}
        height={64}
        rx={8}
        strokeWidth={1.5}
        className="fill-canvas stroke-hairline"
      />
      <text x={430} y={146} className="fill-ink text-[12.5px] font-medium">
        Sustained — worth a URL?
      </text>
      <text x={430} y={166} className="fill-body-mid text-[10.5px]">
        content · practice · progress
      </text>

      <path
        d="M200 182V213"
        fill="none"
        strokeWidth={1.5}
        markerEnd="url(#routing-arrow)"
        className="stroke-body-mid"
      />
      <path
        d="M560 182V213"
        fill="none"
        strokeWidth={1.5}
        markerEnd="url(#routing-arrow)"
        className="stroke-body-mid"
      />
      <text x={212} y={200} className="fill-mute text-[9.5px] font-mono">
        yes
      </text>
      <text x={572} y={200} className="fill-mute text-[9.5px] font-mono">
        yes
      </text>

      <rect
        x={50}
        y={214}
        width={300}
        height={66}
        rx={8}
        strokeWidth={1.5}
        className="fill-accent/5 stroke-accent/40"
      />
      <text x={70} y={242} className="fill-accent text-[12.5px] font-medium">
        Overlay
      </text>
      <text x={70} y={262} className="fill-body-mid text-[10.5px]">
        ⌘K · assistant · sync panel
      </text>

      <rect
        x={410}
        y={214}
        width={300}
        height={66}
        rx={8}
        strokeWidth={1.5}
        className="fill-accent/5 stroke-accent/40"
      />
      <text x={430} y={242} className="fill-accent text-[12.5px] font-medium">
        Route
      </text>
      <text x={430} y={262} className="fill-body-mid text-[10.5px]">
        /problems/la-001 · /paths/… · /labs
      </text>

      <text
        x={200}
        y={306}
        textAnchor="middle"
        className="fill-mute text-[10px] font-mono"
      >
        Escape closes the top layer; focus returns
      </text>
      <text
        x={560}
        y={306}
        textAnchor="middle"
        className="fill-mute text-[10px] font-mono"
      >
        shareable URL · back control · SSG
      </text>

      <text
        x={380}
        y={330}
        textAnchor="middle"
        className="fill-accent text-[10.5px]"
      >
        {"Opening a problem always navigates to /problems/<id> — never an overlay."}
      </text>
    </svg>
  );
}
