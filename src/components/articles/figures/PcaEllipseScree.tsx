const CX = 190;
const CY = 202;
const S = 36;
const ANGLE_DEG = 33;
const SIGMA_1 = 2.2;
const SIGMA_2 = 0.8;
const CUT_COS = Math.cos((ANGLE_DEG * Math.PI) / 180);
const CUT_SIN = Math.sin((ANGLE_DEG * Math.PI) / 180);
const AXIS_1_HALF = SIGMA_1 * S;
const AXIS_2_HALF = SIGMA_2 * S;

const SCATTER: [number, number][] = [
  [-2.0, -0.2],
  [-1.6, 0.9],
  [-1.2, -0.9],
  [-0.8, 0.3],
  [-0.4, -0.3],
  [0.0, 0.8],
  [0.3, -0.1],
  [0.7, 0.5],
  [1.0, -0.6],
  [1.4, 0.2],
  [1.7, 1.1],
  [2.1, 0.5],
  [-0.2, -1.1],
  [0.9, 1.6],
];

const SCREE = [4.84, 0.64, 0.29, 0.11, 0.04];
const SCREE_TOTAL = SCREE.reduce((sum, value) => sum + value, 0);
const SCREE_BASE = 310;
const SCREE_TOP = 150;
const SCREE_SCALE = (SCREE_BASE - SCREE_TOP) / SCREE[0];

const RESIDUAL_FRACTION = [1, ...SCREE.map((_, i) => {
  const tail = SCREE.slice(i + 1).reduce((sum, value) => sum + value, 0);
  return tail / SCREE_TOTAL;
})];
const EY_BASE = 310;
const EY_TOP = 190;

export function PcaEllipseScree() {
  const x1 = {
    x: CUT_COS * AXIS_1_HALF,
    y: CUT_SIN * AXIS_1_HALF,
  };
  const x2 = {
    x: -CUT_SIN * AXIS_2_HALF,
    y: CUT_COS * AXIS_2_HALF,
  };

  return (
    <svg
      viewBox="0 0 760 380"
      role="img"
      aria-labelledby="pcaprog-title pcaprog-desc"
      className="h-auto w-full"
    >
      <title id="pcaprog-title">
        Covariance ellipse with principal axes, a scree plot, and the Eckart-Young truncation error
      </title>
      <desc id="pcaprog-desc">
        Three panels. On the left, a point cloud inside its covariance ellipse,
        with the two principal axes drawn from the center and labelled lambda
        one equal to 4.84 and lambda two equal to 0.64. In the middle, a scree
        plot of five eigenvalues as bars, the first bar dominant, with a dashed
        cut after the second component. On the right, the Eckart-Young identity
        shows the squared Frobenius error of a rank r truncation equals the sum
        of the dropped eigenvalues squared; cutting at r equals two of five
        components keeps 92.6 percent of the variance.
      </desc>
      <defs>
        <marker
          id="pcaprog-arrow"
          viewBox="0 0 10 10"
          refX="8"
          refY="5"
          markerWidth="6"
          markerHeight="6"
          orient="auto"
        >
          <path d="M0 0 10 5 0 10z" className="fill-accent" />
        </marker>
        <marker
          id="pcaprog-arrow-info"
          viewBox="0 0 10 10"
          refX="8"
          refY="5"
          markerWidth="6"
          markerHeight="6"
          orient="auto"
        >
          <path d="M0 0 10 5 0 10z" className="fill-info" />
        </marker>
      </defs>

      <text x={30} y={26} className="fill-ink text-[12.5px] font-medium">
        Covariance is a shape &middot; two axes hold the variance
      </text>
      <text x={30} y={42} className="fill-mute text-[9.5px] font-mono">
        the ellipse x&#7480;C&#8315;&#185;x = 1 &middot; semi-axes &#8730;&#955;&#7522; &middot; ordered by eigenvalue
      </text>

      <g>
        <ellipse
          cx={CX}
          cy={CY}
          rx={AXIS_1_HALF}
          ry={AXIS_2_HALF}
          transform={`rotate(${-ANGLE_DEG} ${CX} ${CY})`}
          strokeWidth={1.5}
          className="fill-accent/5 stroke-accent/40"
        />
        <path
          d={`M${CX - x1.x} ${CY + x1.y}L${CX + x1.x} ${CY - x1.y}`}
          fill="none"
          strokeWidth={1.5}
          markerEnd="url(#pcaprog-arrow)"
          className="stroke-accent"
        />
        <path
          d={`M${CX + x2.x} ${CY - x2.y}L${CX - x2.x} ${CY + x2.y}`}
          fill="none"
          strokeWidth={1.5}
          markerEnd="url(#pcaprog-arrow-info)"
          className="stroke-info"
        />
        {SCATTER.map(([x, y], i) => (
          <circle
            key={`point-${i}`}
            cx={CX + x * S}
            cy={CY - y * S}
            r={3.2}
            className="fill-ink"
          />
        ))}
        <text x={CX + x1.x + 8} y={CY - x1.y + 4} className="fill-accent text-[9.5px] font-mono">
          &#955;&#8321; = 4.84
        </text>
        <text
          x={CX + x2.x - 12}
          y={CY - x2.y - 10}
          textAnchor="end"
          className="fill-info text-[9.5px] font-mono"
        >
          &#955;&#8322; = 0.64
        </text>
        <text x={30} y={356} className="fill-body-mid text-[9.5px]">
          tilt comes from the covariance, not the coordinates
        </text>
      </g>

      <path d="M356 60V340" fill="none" strokeWidth={1} className="stroke-hairline" />

      <text x={386} y={82} className="fill-ink text-[11px] font-medium">
        scree: variance per component
      </text>
      {SCREE.map((value, i) => {
        const height = value * SCREE_SCALE;
        const x = 396 + i * 40;
        const kept = i < 2;
        return (
          <g key={`scree-${i}`}>
            <rect
              x={x}
              y={SCREE_BASE - height}
              width={26}
              height={Math.max(2, height)}
              rx={2}
              strokeWidth={1.5}
              className={kept ? "fill-accent/60 stroke-accent" : "fill-canvas-soft stroke-hairline"}
            />
            <text
              x={x + 13}
              y={SCREE_BASE + 16}
              textAnchor="middle"
              className={kept ? "fill-accent text-[9.5px] font-mono" : "fill-mute text-[9.5px] font-mono"}
            >
              {i + 1}
            </text>
          </g>
        );
      })}
      <path
        d="M470 90V318"
        fill="none"
        strokeWidth={1.5}
        strokeDasharray="5 4"
        className="stroke-warning"
      />
      <text x={476} y={102} className="fill-warning text-[9.5px] font-mono">
        truncate at r = 2
      </text>
      <text x={396} y={356} className="fill-body-mid text-[9.5px]">
        steep drop, then a noise tail
      </text>

      <path d="M594 60V340" fill="none" strokeWidth={1} className="stroke-hairline" />

      <text x={614} y={82} className="fill-ink text-[11px] font-medium">
        Eckart&ndash;Young
      </text>
      <text x={614} y={104} className="fill-accent text-[10.5px] font-mono">
        &#8214;X &minus; X&#7523;&#8214;&#178; = &Sigma;&#7522;&#8258;&#7523; &#963;&#7522;&#178;
      </text>
      <text x={614} y={124} className="fill-body-mid text-[9.5px]">
        rank-r truncation has no better
      </text>
      <text x={614} y={138} className="fill-body-mid text-[9.5px]">
        competitor &mdash; drop the tail
      </text>

      {RESIDUAL_FRACTION.map((fraction, r) => {
        const height = fraction * (EY_BASE - EY_TOP);
        const x = 616 + r * 22;
        return (
          <g key={`ey-${r}`}>
            <rect
              x={x}
              y={EY_BASE - Math.max(2, height)}
              width={15}
              height={Math.max(2, height)}
              rx={1.5}
              strokeWidth={1.5}
              className={r === 2 ? "fill-warning/60 stroke-warning" : "fill-canvas-soft stroke-hairline"}
            />
            <text x={x + 7.5} y={EY_BASE + 14} textAnchor="middle" className="fill-mute text-[9px] font-mono">
              {r}
            </text>
          </g>
        );
      })}
      <text x={614} y={EY_BASE + 30} className="fill-body-mid text-[9px] font-mono">
        residual energy fraction
      </text>
      <text x={614} y={356} className="fill-accent text-[9.5px] font-mono">
        r = 2 keeps 92.6%
      </text>
    </svg>
  );
}
