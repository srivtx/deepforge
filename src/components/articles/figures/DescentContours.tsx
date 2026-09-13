const S = 28;
const LEFT = { x: 190, y: 190 };
const RIGHT = { x: 570, y: 190 };
const ETA = 0.08;
const START = { x: 3.4, y: 1 };
const LEVELS = [1, 4, 9, 16, 25];
const STEPS = 9;

function trajectory(kappa: number) {
  const points: { x: number; y: number }[] = [];
  let x = START.x;
  let y = START.y;
  for (let t = 0; t <= STEPS; t++) {
    points.push({ x, y });
    x = x * (1 - 2 * ETA);
    y = y * (1 - 2 * ETA * kappa);
  }
  return points;
}

function toPath(origin: { x: number; y: number }, points: { x: number; y: number }[]) {
  return points
    .map(
      (p, i) =>
        `${i === 0 ? "M" : "L"}${origin.x + p.x * S} ${origin.y - p.y * S}`,
    )
    .join("");
}

export function DescentContours() {
  const smooth = trajectory(1);
  const stretched = trajectory(10);

  return (
    <svg
      viewBox="0 0 760 340"
      role="img"
      aria-labelledby="descentcontours-title descentcontours-desc"
      className="h-auto w-full"
    >
      <title id="descentcontours-title">
        Gradient descent on well-scaled and badly-scaled contours
      </title>
      <desc id="descentcontours-desc">
        Two contour plots of quadratic losses with the same start point and
        learning rate. Circular contours on the left give a straight path into
        the minimum. Elongated contours on the right give the same update rule a
        zig-zag path that crosses the valley on every step and crawls along it.
      </desc>

      <text x={60} y={32} className="fill-ink text-[12.5px] font-medium">
        well-scaled · circular contours
      </text>
      <text x={60} y={48} className="fill-body-mid text-[9.5px] font-mono">
        every step points at the minimum
      </text>
      <text x={60} y={64} className="fill-mute text-[9.5px] font-mono">
        f = x² + y² · η = 0.08
      </text>

      <text x={420} y={32} className="fill-ink text-[12.5px] font-medium">
        badly-scaled · elongated contours
      </text>
      <text x={420} y={48} className="fill-body-mid text-[9.5px] font-mono">
        steps zig-zag across the valley
      </text>
      <text x={420} y={64} className="fill-mute text-[9.5px] font-mono">
        f = x² + 10y² · same η
      </text>

      <path d="M54 190H326" fill="none" strokeWidth={1} className="stroke-hairline" />
      <path d="M190 62V318" fill="none" strokeWidth={1} className="stroke-hairline" />
      <path d="M434 190H706" fill="none" strokeWidth={1} className="stroke-hairline" />
      <path d="M570 62V318" fill="none" strokeWidth={1} className="stroke-hairline" />

      {LEVELS.map((c) => (
        <ellipse
          key={`l-${c}`}
          cx={LEFT.x}
          cy={LEFT.y}
          rx={Math.sqrt(c) * S}
          ry={Math.sqrt(c) * S}
          fill="none"
          strokeWidth={1}
          className="stroke-hairline"
        />
      ))}
      {LEVELS.map((c) => (
        <ellipse
          key={`r-${c}`}
          cx={RIGHT.x}
          cy={RIGHT.y}
          rx={Math.sqrt(c) * S}
          ry={Math.sqrt(c / 10) * S}
          fill="none"
          strokeWidth={1}
          className="stroke-hairline"
        />
      ))}

      <path
        d={toPath(LEFT, smooth)}
        fill="none"
        strokeWidth={1.5}
        className="stroke-accent"
      />
      {smooth.map((p, i) => (
        <circle
          key={`ls-${i}`}
          cx={LEFT.x + p.x * S}
          cy={LEFT.y - p.y * S}
          r={2.5}
          className="fill-accent"
        />
      ))}
      <path
        d={toPath(RIGHT, stretched)}
        fill="none"
        strokeWidth={1.5}
        className="stroke-warning"
      />
      {stretched.map((p, i) => (
        <circle
          key={`rs-${i}`}
          cx={RIGHT.x + p.x * S}
          cy={RIGHT.y - p.y * S}
          r={2.5}
          className="fill-warning"
        />
      ))}

      <circle
        cx={LEFT.x + START.x * S}
        cy={LEFT.y - START.y * S}
        r={3.5}
        strokeWidth={1.5}
        className="fill-canvas stroke-body"
      />
      <circle
        cx={RIGHT.x + START.x * S}
        cy={RIGHT.y - START.y * S}
        r={3.5}
        strokeWidth={1.5}
        className="fill-canvas stroke-body"
      />
      <text
        x={LEFT.x + START.x * S}
        y={LEFT.y - START.y * S - 12}
        textAnchor="middle"
        className="fill-body-mid text-[9.5px] font-mono"
      >
        start
      </text>
      <text
        x={RIGHT.x + START.x * S}
        y={RIGHT.y - START.y * S - 12}
        textAnchor="middle"
        className="fill-body-mid text-[9.5px] font-mono"
      >
        start
      </text>

      <circle
        cx={LEFT.x}
        cy={LEFT.y}
        r={6}
        fill="none"
        strokeWidth={1.5}
        className="stroke-accent"
      />
      <circle cx={LEFT.x} cy={LEFT.y} r={1.5} className="fill-accent" />
      <circle
        cx={RIGHT.x}
        cy={RIGHT.y}
        r={6}
        fill="none"
        strokeWidth={1.5}
        className="stroke-accent"
      />
      <circle cx={RIGHT.x} cy={RIGHT.y} r={1.5} className="fill-accent" />
      <text
        x={LEFT.x}
        y={216}
        textAnchor="middle"
        className="fill-accent text-[9.5px] font-mono"
      >
        minimum
      </text>
      <text
        x={RIGHT.x}
        y={216}
        textAnchor="middle"
        className="fill-accent text-[9.5px] font-mono"
      >
        minimum
      </text>

      <circle cx={40} cy={322} r={3} className="fill-accent" />
      <text x={50} y={326} className="fill-accent text-[10.5px]">
        Same rule, same start, same step size — conditioning decides the path.
      </text>
    </svg>
  );
}
