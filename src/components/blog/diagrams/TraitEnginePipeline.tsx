const LAYERS: { name: string; count: number }[] = [
  { name: "background", count: 10 },
  { name: "clothing", count: 8 },
  { name: "head", count: 12 },
  { name: "mouth", count: 14 },
  { name: "eyes", count: 10 },
  { name: "headwear", count: 13 },
  { name: "accessories", count: 13 },
  { name: "extras", count: 13 },
];

const ROW_TOP = 190;
const ROW_HEIGHT = 15;
const ROW_GAP = 1.5;

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
        height={62}
        rx={8}
        strokeWidth={1.5}
        className={
          accent ? "fill-accent/5 stroke-accent/40" : "fill-canvas stroke-hairline"
        }
      />
      <text
        x={x + 18}
        y={y + 27}
        className={
          accent
            ? "fill-accent text-[12.5px] font-medium"
            : "fill-ink text-[12.5px] font-medium"
        }
      >
        {title}
      </text>
      <text
        x={x + 18}
        y={y + 47}
        className="fill-body-mid text-[9.5px] font-mono"
      >
        {sub}
      </text>
    </g>
  );
}

export function TraitEnginePipeline() {
  return (
    <svg
      viewBox="0 0 760 340"
      role="img"
      aria-labelledby="traitpipeline-title traitpipeline-desc"
      className="h-auto w-full"
    >
      <title id="traitpipeline-title">Deterministic trait selection pipeline</title>
      <desc id="traitpipeline-desc">
        A seed string is hashed with FNV-1a and streamed through mulberry32,
        which makes eight rarity-weighted picks — one per category. The chosen
        traits stack in a fixed paint order into one 96 by 96 SVG. The same
        seed always produces the same avatar.
      </desc>
      <defs>
        <pattern
          id="traitpipeline-grid"
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
          id="traitpipeline-arrow"
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
          id="traitpipeline-arrow-accent"
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

      <rect width="760" height="340" fill="url(#traitpipeline-grid)" />

      <text x="40" y="28" className="fill-mute text-[10px] font-mono">
        src/lib/nftAvatar/select.ts
      </text>
      <text
        x="720"
        y="28"
        textAnchor="end"
        className="fill-mute text-[10px] font-mono"
      >
        1 function · 8 picks · 0 state
      </text>

      <Stage x={40} y={76} width={170} title="seed" sub='"nova_7f3a" · user · reroll' />
      <Stage
        x={250}
        y={76}
        width={200}
        title="FNV-1a → mulberry32"
        sub="streams: :traits · :palette"
      />
      <Stage
        x={490}
        y={76}
        width={230}
        title="8 weighted picks"
        sub="weight 1–13, one per category"
        accent
      />

      <path
        d="M210 107H242"
        fill="none"
        strokeWidth={1.5}
        markerEnd="url(#traitpipeline-arrow)"
        className="stroke-body-mid"
      />
      <path
        d="M450 107H482"
        fill="none"
        strokeWidth={1.5}
        markerEnd="url(#traitpipeline-arrow)"
        className="stroke-body-mid"
      />

      <path
        d="M605 138V152H190V184"
        fill="none"
        strokeWidth={1.5}
        markerEnd="url(#traitpipeline-arrow)"
        className="stroke-body-mid"
      />
      <text x="390" y="146" textAnchor="middle" className="fill-mute text-[9.5px] font-mono">
        selectAvatarTraits(seed, style)
      </text>

      <text x="332" y="182" textAnchor="end" className="fill-mute text-[9.5px] font-mono">
        catalog
      </text>
      {LAYERS.map((layer, i) => {
        const top = ROW_TOP + i * (ROW_HEIGHT + ROW_GAP);
        const head = layer.name === "head";
        return (
          <g key={layer.name}>
            <rect
              x={40}
              y={top}
              width={300}
              height={ROW_HEIGHT}
              rx={3}
              strokeWidth={1.5}
              className={
                head
                  ? "fill-accent/5 stroke-accent/40"
                  : "fill-canvas stroke-hairline"
              }
            />
            <text
              x={52}
              y={top + 10.5}
              className={
                head
                  ? "fill-accent text-[10px] font-mono"
                  : "fill-body text-[10px] font-mono"
              }
            >
              {layer.name}
            </text>
            <text
              x={332}
              y={top + 10.5}
              textAnchor="end"
              className="fill-mute text-[9.5px] font-mono"
            >
              {layer.count}
            </text>
          </g>
        );
      })}
      <text x="350" y="234" className="fill-accent text-[9.5px] font-mono">
        rare: macaque · weight 2
      </text>

      <rect
        x={520}
        y={170}
        width={200}
        height={150}
        rx={8}
        strokeWidth={1.5}
        className="fill-canvas stroke-hairline"
      />
      <text
        x={620}
        y={192}
        textAnchor="middle"
        className="fill-ink text-[11.5px] font-medium"
      >
        final SVG · 96×96
      </text>
      <rect
        x={568}
        y={208}
        width={104}
        height={88}
        rx={6}
        strokeWidth={1}
        className="fill-accent/10 stroke-accent/30"
      />
      <circle
        cx={620}
        cy={252}
        r={26}
        strokeWidth={1.5}
        className="fill-canvas stroke-body-mid"
      />
      <circle cx={612} cy={246} r={2.2} className="fill-accent" />
      <circle cx={628} cy={246} r={2.2} className="fill-accent" />
      <path
        d="M612 261Q620 267 628 261"
        fill="none"
        strokeWidth={1.5}
        strokeLinecap="round"
        className="stroke-accent"
      />
      <text
        x={620}
        y={311}
        textAnchor="middle"
        className="fill-mute text-[9.5px] font-mono"
      >
        8 layers · 1 &lt;svg&gt;
      </text>

      <path
        d="M340 256H512"
        fill="none"
        strokeWidth={1.5}
        markerEnd="url(#traitpipeline-arrow-accent)"
        className="stroke-accent"
      />
      <text
        x="426"
        y="248"
        textAnchor="middle"
        className="fill-body-mid text-[9.5px] font-mono"
      >
        fixed paint order
      </text>

      <text
        x="380"
        y="332"
        textAnchor="middle"
        className="fill-accent text-[10.5px]"
      >
        same seed = same avatar — every pick is a pure function of the seed string
      </text>
    </svg>
  );
}
