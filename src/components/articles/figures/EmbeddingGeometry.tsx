const CX = 205;
const CY = 195;
const R = 108;
const THETA_DEG = 55;
const THETA = (THETA_DEG * Math.PI) / 180;
const BX = CX + R * Math.cos(THETA);
const BY = CY - R * Math.sin(THETA);
const ARC_R = 42;
const ARC_END_X = CX + ARC_R * Math.cos(THETA);
const ARC_END_Y = CY - ARC_R * Math.sin(THETA);
const MID = THETA / 2;
const LABEL_X = CX + (ARC_R + 16) * Math.cos(MID);
const LABEL_Y = CY - (ARC_R + 16) * Math.sin(MID);

const ROWS = [
  { deg: "0\u00B0", cos: "1.00", note: "same direction" },
  { deg: "60\u00B0", cos: "0.50", note: "same side, weaker" },
  { deg: "90\u00B0", cos: "0.00", note: "orthogonal" },
  { deg: "180\u00B0", cos: "\u22121.00", note: "exactly opposite" },
];

function Arrow({
  x1,
  y1,
  x2,
  y2,
  stroke,
  width = 2,
}: {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  stroke: string;
  width?: number;
}) {
  const angle = Math.atan2(y2 - y1, x2 - x1);
  const head = 10;
  const hx = x2 - Math.cos(angle) * head;
  const hy = y2 - Math.sin(angle) * head;
  const nx = Math.cos(angle + Math.PI / 2);
  const ny = Math.sin(angle + Math.PI / 2);
  return (
    <g>
      <line
        x1={x1}
        y1={y1}
        x2={hx}
        y2={hy}
        stroke={stroke}
        strokeWidth={width}
        strokeLinecap="round"
      />
      <polygon
        points={`${x2},${y2} ${hx + nx * head * 0.45},${hy + ny * head * 0.45} ${hx - nx * head * 0.45},${hy - ny * head * 0.45}`}
        fill={stroke}
      />
    </g>
  );
}

export function EmbeddingGeometry() {
  return (
    <svg
      viewBox="0 0 760 340"
      role="img"
      aria-labelledby="embgeom-title embgeom-desc"
      className="h-auto w-full"
    >
      <title id="embgeom-title">
        Cosine similarity as a projection onto the unit circle
      </title>
      <desc id="embgeom-desc">
        Two unit vectors a and b sit on a unit circle with an angle theta of 55
        degrees between them. Dropping a perpendicular from b onto a gives a
        projection of length cos theta, about 0.57. A table shows cosine values
        of 1 at 0 degrees, 0.5 at 60 degrees, 0 at 90 degrees, and minus 1 at
        180 degrees.
      </desc>

      <text x={30} y={28} className="fill-ink text-[12.5px] font-medium">
        cosine is a projection onto the unit circle
      </text>
      <text x={30} y={44} className="fill-body-mid text-[9.5px] font-mono">
        cos(a,b) = a&middot;b / (&#8741;a&#8741;&middot;&#8741;b&#8741;)
      </text>

      <line x1={CX - R} y1={CY} x2={CX + R} y2={CY} className="stroke-hairline" />
      <line x1={CX} y1={CY - R} x2={CX} y2={CY + R} className="stroke-hairline" />
      <circle
        cx={CX}
        cy={CY}
        r={R}
        fill="none"
        strokeDasharray="4 4"
        className="stroke-hairline"
      />
      <text
        x={CX}
        y={CY - R - 8}
        textAnchor="middle"
        className="fill-mute text-[9.5px] font-mono"
      >
        unit circle &middot; &#8741;a&#8741; = &#8741;b&#8741; = 1
      </text>

      <line
        x1={BX}
        y1={BY}
        x2={BX}
        y2={CY}
        strokeDasharray="3 4"
        className="stroke-mute"
      />
      <path
        d={`M${BX - 9} ${CY} L${BX - 9} ${CY - 9} L${BX} ${CY - 9}`}
        fill="none"
        className="stroke-mute"
      />

      <Arrow x1={CX} y1={CY} x2={CX + R} y2={CY} stroke="var(--ink)" />
      <line
        x1={CX}
        y1={CY}
        x2={BX}
        y2={CY}
        stroke="var(--accent)"
        strokeWidth={4}
        strokeLinecap="round"
      />
      <Arrow x1={CX} y1={CY} x2={BX} y2={BY} stroke="var(--warning)" />

      <path
        d={`M${CX + ARC_R} ${CY} A ${ARC_R} ${ARC_R} 0 0 0 ${ARC_END_X} ${ARC_END_Y}`}
        fill="none"
        strokeWidth={1.5}
        className="stroke-warning"
      />
      <text
        x={LABEL_X}
        y={LABEL_Y}
        className="fill-warning text-[11px] font-mono"
      >
        &theta; = {THETA_DEG}&deg;
      </text>

      <text
        x={(CX + BX) / 2}
        y={CY + 22}
        textAnchor="middle"
        className="fill-accent text-[10px] font-mono"
      >
        projection = cos &theta; = {Math.cos(THETA).toFixed(2)}
      </text>
      <text x={CX + R + 12} y={CY + 4} className="fill-ink text-[12px] font-mono">
        a
      </text>
      <text x={BX + 9} y={BY - 10} className="fill-warning text-[12px] font-mono">
        b
      </text>

      <text x={30} y={322} className="fill-body-mid text-[10px]">
        the dashed drop is the projection of b onto a
      </text>

      <text x={400} y={28} className="fill-ink text-[12.5px] font-medium">
        cos &theta; across the four landmark angles
      </text>
      <text x={400} y={44} className="fill-body-mid text-[9.5px] font-mono">
        magnitude never enters the table
      </text>

      <text x={400} y={92} className="fill-mute text-[9.5px] font-mono">
        &theta;
      </text>
      <text x={470} y={92} className="fill-mute text-[9.5px] font-mono">
        cos &theta;
      </text>
      <text x={560} y={92} className="fill-mute text-[9.5px] font-mono">
        meaning
      </text>
      <path d="M400 100H742" fill="none" className="stroke-hairline" />

      {ROWS.map((row, i) => (
        <g key={row.deg}>
          <text
            x={400}
            y={126 + i * 34}
            className="fill-ink text-[11.5px] font-mono"
          >
            {row.deg}
          </text>
          <text
            x={470}
            y={126 + i * 34}
            className={
              i >= 2
                ? "fill-accent text-[11.5px] font-mono"
                : "fill-ink text-[11.5px] font-mono"
            }
          >
            {row.cos}
          </text>
          <text x={560} y={126 + i * 34} className="fill-body-mid text-[10.5px]">
            {row.note}
          </text>
          <path
            d={`M400 ${140 + i * 34}H742`}
            fill="none"
            strokeOpacity="0.6"
            className="stroke-hairline"
          />
        </g>
      ))}

      <text x={400} y={296} className="fill-body-mid text-[10px]">
        90&deg; gives 0: no shared direction at any length.
      </text>
      <text x={400} y={318} className="fill-accent text-[10.5px]">
        only the angle matters &mdash; scaling never changes cosine.
      </text>
    </svg>
  );
}
