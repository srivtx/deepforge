const S = 34;
const LEFT = { x: 190, y: 180 };
const RIGHT = { x: 570, y: 180 };
const E1 = { x: 0.93908, y: 0.3437 };
const V = { x: 1.4 * E1.x, y: 1.4 * E1.y };
const W = { x: 0.5, y: 1.5 };

const UNIT_X = [-4, -3, -2, -1, 0, 1, 2, 3, 4];
const UNIT_Y = [-3, -2, -1, 0, 1, 2, 3];

function apply(p: { x: number; y: number }) {
  return { x: 2 * p.x + p.y, y: 0.5 * p.x + p.y };
}

function sx(ox: number, x: number) {
  return ox + x * S;
}

function sy(oy: number, y: number) {
  return oy - y * S;
}

export function EigenvectorGrid() {
  const av = apply(V);
  const aw = apply(W);

  return (
    <svg
      viewBox="0 0 760 340"
      role="img"
      aria-labelledby="eigengrid-title eigengrid-desc"
      className="h-auto w-full"
    >
      <title id="eigengrid-title">
        A two by two transform acting on a grid and on two vectors
      </title>
      <desc id="eigengrid-desc">
        Two panels of the same unit grid. On the left, vector v sits on a true
        eigendirection, drawn as a dashed line through the origin, and vector w
        does not. On the right the grid is warped by the matrix: Av is longer
        but still lies on the dashed line, exactly lambda times v, while Aw has
        rotated off the direction of w.
      </desc>
      <defs>
        <marker
          id="eigengrid-arrow"
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
          id="eigengrid-arrow-accent"
          viewBox="0 0 10 10"
          refX="8"
          refY="5"
          markerWidth="6"
          markerHeight="6"
          orient="auto"
        >
          <path d="M0 0 10 5 0 10z" className="fill-accent" />
        </marker>
        <clipPath id="eigengrid-right-clip">
          <rect x={400} y={44} width={330} height={280} />
        </clipPath>
      </defs>

      <text x={60} y={32} className="fill-ink text-[12.5px] font-medium">
        before · unit grid
      </text>
      <text x={60} y={48} className="fill-body-mid text-[9.5px] font-mono">
        v on the dashed eigendirection, w off it
      </text>
      <text x={415} y={32} className="fill-ink text-[12.5px] font-medium">
        after · the same grid, warped by A
      </text>
      <text x={415} y={48} className="fill-body-mid text-[9.5px] font-mono">
        A = [[2, 1], [0.5, 1]] · straight lines stay straight
      </text>

      <g>
        {UNIT_X.map((c) => (
          <path
            key={`l-v-${c}`}
            d={`M${sx(LEFT.x, c)} ${sy(LEFT.y, -3)}V${sy(LEFT.y, 3)}`}
            fill="none"
            strokeWidth={1}
            className="stroke-hairline"
          />
        ))}
        {UNIT_Y.map((r) => (
          <path
            key={`l-h-${r}`}
            d={`M${sx(LEFT.x, -4)} ${sy(LEFT.y, r)}H${sx(LEFT.x, 4)}`}
            fill="none"
            strokeWidth={1}
            className="stroke-hairline"
          />
        ))}

        <polygon
          points={`${LEFT.x},${LEFT.y} ${sx(LEFT.x, 1)},${LEFT.y} ${sx(LEFT.x, 1)},${sy(LEFT.y, 1)} ${LEFT.x},${sy(LEFT.y, 1)}`}
          strokeWidth={1.5}
          className="fill-accent/5 stroke-accent/40"
        />

        <path
          d={`M${sx(LEFT.x, -3.5685)} ${sy(LEFT.y, -1.3061)}L${sx(LEFT.x, 3.5685)} ${sy(LEFT.y, 1.3061)}`}
          fill="none"
          strokeWidth={1.5}
          strokeDasharray="5 4"
          className="stroke-accent/50"
        />
        <path
          d={`M${LEFT.x} ${LEFT.y}L${sx(LEFT.x, V.x)} ${sy(LEFT.y, V.y)}`}
          fill="none"
          strokeWidth={1.5}
          markerEnd="url(#eigengrid-arrow-accent)"
          className="stroke-accent"
        />
        <path
          d={`M${LEFT.x} ${LEFT.y}L${sx(LEFT.x, W.x)} ${sy(LEFT.y, W.y)}`}
          fill="none"
          strokeWidth={1.5}
          markerEnd="url(#eigengrid-arrow)"
          className="stroke-body-mid"
        />

        <text x={242} y={158} className="fill-accent text-[11px] font-mono">
          v
        </text>
        <text
          x={199}
          y={122}
          textAnchor="end"
          className="fill-body-mid text-[11px] font-mono"
        >
          w
        </text>
        <text
          x={306}
          y={242}
          textAnchor="end"
          className="fill-accent text-[9.5px] font-mono"
        >
          true eigendirection
        </text>
      </g>

      <g>
        <g clipPath="url(#eigengrid-right-clip)" opacity={0.65}>
          {UNIT_X.map((c) => {
            const a = apply({ x: c, y: -3 });
            const b = apply({ x: c, y: 3 });
            return (
              <path
                key={`r-v-${c}`}
                d={`M${sx(RIGHT.x, a.x)} ${sy(RIGHT.y, a.y)}L${sx(RIGHT.x, b.x)} ${sy(RIGHT.y, b.y)}`}
                fill="none"
                strokeWidth={1}
                className="stroke-hairline"
              />
            );
          })}
          {UNIT_Y.map((r) => {
            const a = apply({ x: -4, y: r });
            const b = apply({ x: 4, y: r });
            return (
              <path
                key={`r-h-${r}`}
                d={`M${sx(RIGHT.x, a.x)} ${sy(RIGHT.y, a.y)}L${sx(RIGHT.x, b.x)} ${sy(RIGHT.y, b.y)}`}
                fill="none"
                strokeWidth={1}
                className="stroke-hairline"
              />
            );
          })}
        </g>

        <polygon
          points={`${RIGHT.x},${RIGHT.y} ${sx(RIGHT.x, 2)},${sy(RIGHT.y, 0.5)} ${sx(RIGHT.x, 3)},${sy(RIGHT.y, 1.5)} ${sx(RIGHT.x, 1)},${sy(RIGHT.y, 1)}`}
          strokeWidth={1.5}
          className="fill-accent/5 stroke-accent/40"
        />

        <path
          d={`M${sx(RIGHT.x, -3.5685)} ${sy(RIGHT.y, -1.3061)}L${sx(RIGHT.x, 3.5685)} ${sy(RIGHT.y, 1.3061)}`}
          fill="none"
          strokeWidth={1.5}
          strokeDasharray="5 4"
          className="stroke-accent/50"
        />
        <path
          d={`M${RIGHT.x} ${RIGHT.y}L${sx(RIGHT.x, W.x)} ${sy(RIGHT.y, W.y)}`}
          fill="none"
          strokeWidth={1.5}
          strokeDasharray="4 4"
          className="stroke-body-mid/40"
        />
        <path
          d={`M${RIGHT.x} ${RIGHT.y}L${sx(RIGHT.x, aw.x)} ${sy(RIGHT.y, aw.y)}`}
          fill="none"
          strokeWidth={1.5}
          markerEnd="url(#eigengrid-arrow)"
          className="stroke-body-mid"
        />
        <path
          d={`M${RIGHT.x} ${RIGHT.y}L${sx(RIGHT.x, av.x)} ${sy(RIGHT.y, av.y)}`}
          fill="none"
          strokeWidth={1.5}
          markerEnd="url(#eigengrid-arrow-accent)"
          className="stroke-accent"
        />
        <text x={616} y={119} className="fill-warning text-[9.5px] font-mono">
          rotates
        </text>
        <path
          d={`M${sx(RIGHT.x, 0.5115)} ${sy(RIGHT.y, 1.5347)} A55 55 0 0 1 ${sx(RIGHT.x, 1.3253)} ${sy(RIGHT.y, 0.9276)}`}
          fill="none"
          strokeWidth={1.5}
          className="stroke-warning"
        />
        <text x={663} y={134} className="fill-body-mid text-[11px] font-mono">
          Aw
        </text>
        <text x={616} y={119} className="fill-warning text-[9.5px] font-mono">
          rotates
        </text>
      </g>

      <circle cx={40} cy={324} r={3} className="fill-accent" />
      <text x={50} y={328} className="fill-accent text-[10.5px]">
        Av stays on the dashed line — every other direction leaves its line.
      </text>
    </svg>
  );
}
