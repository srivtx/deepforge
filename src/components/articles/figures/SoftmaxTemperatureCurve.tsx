const LOGITS = [2.0, 1.0, 0.5, -0.5, -1.0];

const PANELS = [
  { temp: 0.2, note: "near one-hot" },
  { temp: 1, note: "standard softmax" },
  { temp: 5, note: "near uniform" },
] as const;

const PANEL_X = [40, 290, 540];
const BAR_BASE = 254;
const BAR_HEIGHT = 150;
const BAR_W = 20;
const BAR_STEP = 30;
const TITLE_Y = 52;
const NOTE_Y = 68;

function softmax(logits: number[], temp: number): number[] {
  const scaled = logits.map((z) => z / temp);
  const max = Math.max(...scaled);
  const exps = scaled.map((z) => Math.exp(z - max));
  const sum = exps.reduce((a, b) => a + b, 0);
  return exps.map((e) => e / sum);
}

export function SoftmaxTemperatureCurve() {
  const probs = PANELS.map((panel) => softmax(LOGITS, panel.temp));

  return (
    <svg
      viewBox="0 0 760 312"
      role="img"
      aria-labelledby="softmaxcurve-title softmaxcurve-desc"
      className="h-auto w-full"
    >
      <title id="softmaxcurve-title">
        Softmax probabilities at three temperatures
      </title>
      <desc id="softmaxcurve-desc">
        Three panels show the same five logits at temperature 0.2, 1, and 5. At
        0.2 the distribution is a near one-hot spike on class 1, at 1 it is the
        standard softmax, and at 5 it flattens toward uniform. Class 1 stays the
        most probable class in every panel because temperature rescales
        confidence but never changes the ranking.
      </desc>

      <text x={40} y={24} className="fill-mute text-[10px] font-mono">
        fixed logits z = [2.0, 1.0, 0.5, −0.5, −1.0]
      </text>
      <text
        x={720}
        y={24}
        textAnchor="end"
        className="fill-accent text-[10px] font-mono"
      >
        argmax = class 1
      </text>

      <path
        d="M255 40V272"
        fill="none"
        strokeWidth={1}
        className="stroke-hairline"
      />
      <path
        d="M505 40V272"
        fill="none"
        strokeWidth={1}
        className="stroke-hairline"
      />

      {PANELS.map((panel, p) => {
        const x0 = PANEL_X[p];
        const p0 = probs[p];
        const argmaxTop = BAR_BASE - p0[0] * BAR_HEIGHT;
        return (
          <g key={panel.temp}>
            <text
              x={x0 + 20}
              y={TITLE_Y}
              className="fill-ink text-[12.5px] font-medium"
            >
              T = {panel.temp}
            </text>
            <text
              x={x0 + 20}
              y={NOTE_Y}
              className="fill-body-mid text-[9.5px] font-mono"
            >
              {panel.note}
            </text>

            {[1, 0.5, 0].map((level) => (
              <path
                key={level}
                d={`M${x0 + 8} ${BAR_BASE - level * BAR_HEIGHT}H${x0 + 172}`}
                fill="none"
                strokeWidth={1}
                className="stroke-hairline"
              />
            ))}

            {p0.map((prob, i) => {
              const height = Math.max(3, prob * BAR_HEIGHT);
              const x = x0 + 20 + i * BAR_STEP;
              const isArgmax = i === 0;
              return (
                <g key={i}>
                  <rect
                    x={x}
                    y={BAR_BASE - height}
                    width={BAR_W}
                    height={height}
                    rx={3}
                    strokeWidth={1.5}
                    className={
                      isArgmax
                        ? "fill-accent/60 stroke-accent"
                        : "fill-canvas-soft stroke-hairline"
                    }
                  />
                  <text
                    x={x + BAR_W / 2}
                    y={BAR_BASE + 16}
                    textAnchor="middle"
                    className={
                      isArgmax
                        ? "fill-accent text-[9.5px] font-mono"
                        : "fill-body-mid text-[9.5px] font-mono"
                    }
                  >
                    {i + 1}
                  </text>
                </g>
              );
            })}

            <text
              x={x0 + 30}
              y={argmaxTop - 8}
              textAnchor="middle"
              className="fill-accent text-[10px] font-mono"
            >
              {p0[0].toFixed(2)}
            </text>
          </g>
        );
      })}

      <text x={44} y={107} textAnchor="end" className="fill-mute text-[9px] font-mono">
        1.0
      </text>
      <text x={44} y={182} textAnchor="end" className="fill-mute text-[9px] font-mono">
        0.5
      </text>
      <text x={44} y={257} textAnchor="end" className="fill-mute text-[9px] font-mono">
        0
      </text>

      <path
        d="M70 280H570"
        fill="none"
        strokeWidth={1.5}
        strokeDasharray="4 4"
        className="stroke-accent/40"
      />
      {[70, 320, 570].map((x) => (
        <circle key={x} cx={x} cy={280} r={2.5} className="fill-accent" />
      ))}
      <text
        x={320}
        y={300}
        textAnchor="middle"
        className="fill-accent text-[10px]"
      >
        the same class wins at every temperature
      </text>
    </svg>
  );
}
