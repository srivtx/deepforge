const BEFORE_CONF = [0.6, 0.71, 0.82, 0.91, 0.96, 0.985];
const BEFORE_ACC = [0.56, 0.64, 0.72, 0.79, 0.83, 0.86];
const AFTER_CONF = [0.575, 0.66, 0.735, 0.795, 0.835, 0.85];
const BIN_COUNTS = [0.18, 0.2, 0.22, 0.18, 0.14, 0.08];

const PLOT_X0 = 86;
const PLOT_X1 = 330;
const PLOT_Y0 = 70;
const PLOT_Y1 = 314;

function px(value: number): number {
  return PLOT_X0 + value * (PLOT_X1 - PLOT_X0);
}

function py(value: number): number {
  return PLOT_Y1 - value * (PLOT_Y1 - PLOT_Y0);
}

const BEFORE_ECE = BEFORE_CONF.reduce(
  (sum, confidence, i) => sum + BIN_COUNTS[i] * Math.abs(BEFORE_ACC[i] - confidence),
  0,
);
const AFTER_ECE = AFTER_CONF.reduce(
  (sum, confidence, i) => sum + BIN_COUNTS[i] * Math.abs(BEFORE_ACC[i] - confidence),
  0,
);

export function CalibrationReliability() {
  return (
    <svg
      viewBox="0 0 760 380"
      role="img"
      aria-labelledby="calibration-title calibration-desc"
      className="h-auto w-full"
    >
      <title id="calibration-title">
        Reliability diagram before and after temperature scaling
      </title>
      <desc id="calibration-desc">
        Left: a reliability diagram with confidence on the horizontal axis and
        accuracy on the vertical axis. Six bins from an overconfident model sit
        below the dashed diagonal; the same bins after temperature scaling lie
        almost on it. Right: the temperature-scaling formula maps a logit
        through a sigmoid divided by T, fitted on a validation set by negative
        log-likelihood. Expected calibration error falls from 0.093 to 0.012
        while accuracy stays at 0.71.
      </desc>

      <text x={30} y={26} className="fill-ink text-[12.5px] font-medium">
        Say 90%, be right 90% of the time
      </text>
      <text x={30} y={42} className="fill-mute text-[9.5px] font-mono">
        reliability diagram &middot; confidence x, accuracy y &middot; the diagonal is perfect calibration
      </text>

      <line x1={PLOT_X0} y1={PLOT_Y1} x2={PLOT_X1} y2={PLOT_Y1} strokeWidth={1.5} className="stroke-hairline" />
      <line x1={PLOT_X0} y1={PLOT_Y0} x2={PLOT_X0} y2={PLOT_Y1} strokeWidth={1.5} className="stroke-hairline" />
      <line
        x1={px(0)}
        y1={py(0)}
        x2={px(1)}
        y2={py(1)}
        strokeWidth={1.5}
        strokeDasharray="5 5"
        className="stroke-accent/40"
      />

      {[0, 0.25, 0.5, 0.75, 1].map((tick) => (
        <g key={`tick-${tick}`}>
          <line x1={px(tick)} y1={PLOT_Y1} x2={px(tick)} y2={PLOT_Y1 + 4} className="stroke-hairline" />
          <line x1={PLOT_X0 - 4} y1={py(tick)} x2={PLOT_X0} y2={py(tick)} className="stroke-hairline" />
          <text x={px(tick)} y={PLOT_Y1 + 18} textAnchor="middle" className="fill-mute text-[9px] font-mono">
            {tick.toFixed(2)}
          </text>
          {tick !== 0 && (
            <text x={PLOT_X0 - 8} y={py(tick) + 3} textAnchor="end" className="fill-mute text-[9px] font-mono">
              {tick.toFixed(2)}
            </text>
          )}
        </g>
      ))}

      {BEFORE_CONF.map((confidence, i) => (
        <g key={`bin-${i}`}>
          <line
            x1={px(confidence)}
            y1={py(confidence)}
            x2={px(confidence)}
            y2={py(BEFORE_ACC[i])}
            strokeWidth={1.5}
            className="stroke-warning/70"
          />
          <line
            x1={px(confidence)}
            y1={py(BEFORE_ACC[i])}
            x2={px(AFTER_CONF[i])}
            y2={py(BEFORE_ACC[i])}
            strokeWidth={1}
            strokeDasharray="3 3"
            className="stroke-body-mid/50"
          />
          <circle cx={px(confidence)} cy={py(BEFORE_ACC[i])} r={3.4} className="fill-mute" />
          <circle cx={px(AFTER_CONF[i])} cy={py(BEFORE_ACC[i])} r={4} className="fill-accent" />
        </g>
      ))}

      <text x={PLOT_X0} y={PLOT_Y0 - 16} className="fill-mute text-[9px] font-mono">
        accuracy
      </text>
      <text x={PLOT_X1} y={PLOT_Y1 + 34} textAnchor="end" className="fill-mute text-[9px] font-mono">
        confidence
      </text>
      <circle cx={PLOT_X0 + 8} cy={PLOT_Y0 + 10} r={3.4} className="fill-mute" />
      <text x={PLOT_X0 + 16} y={PLOT_Y0 + 13} className="fill-mute text-[9.5px] font-mono">
        T = 1
      </text>
      <circle cx={PLOT_X0 + 64} cy={PLOT_Y0 + 10} r={4} className="fill-accent" />
      <text x={PLOT_X0 + 72} y={PLOT_Y0 + 13} className="fill-accent text-[9.5px] font-mono">
        T = 2.4
      </text>

      <path d="M358 60V340" fill="none" strokeWidth={1} className="stroke-hairline" />

      <text x={382} y={96} className="fill-accent text-[13px] font-mono">
        p&#770; = &sigma;(z / T)
      </text>
      <text x={382} y={116} className="fill-body-mid text-[9.5px]">
        one scalar, fitted on a validation set
      </text>
      <text x={382} y={132} className="fill-body-mid text-[9.5px]">
        by negative log-likelihood
      </text>

      <text x={382} y={170} className="fill-ink text-[10.5px] font-medium">
        what moves, what does not
      </text>
      <text x={382} y={194} className="fill-body-mid text-[9.5px] font-mono">
        ECE
      </text>
      <text x={462} y={194} className="fill-warning text-[9.5px] font-mono">
        {BEFORE_ECE.toFixed(3)}
      </text>
      <text x={512} y={194} className="fill-mute text-[9.5px] font-mono">
        &rarr;
      </text>
      <text x={530} y={194} className="fill-accent text-[9.5px] font-mono">
        {AFTER_ECE.toFixed(3)}
      </text>
      <text x={382} y={216} className="fill-body-mid text-[9.5px] font-mono">
        mean conf
      </text>
      <text x={462} y={216} className="fill-ink text-[9.5px] font-mono">
        0.81
      </text>
      <text x={512} y={216} className="fill-mute text-[9.5px] font-mono">
        &rarr;
      </text>
      <text x={530} y={216} className="fill-ink text-[9.5px] font-mono">
        0.75
      </text>
      <text x={382} y={238} className="fill-body-mid text-[9.5px] font-mono">
        accuracy
      </text>
      <text x={462} y={238} className="fill-ink text-[9.5px] font-mono">
        0.71
      </text>
      <text x={512} y={238} className="fill-mute text-[9.5px] font-mono">
        &rarr;
      </text>
      <text x={530} y={238} className="fill-ink text-[9.5px] font-mono">
        0.71
      </text>
      <text x={382} y={260} className="fill-body-mid text-[9.5px] font-mono">
        temperature
      </text>
      <text x={462} y={260} className="fill-ink text-[9.5px] font-mono">
        1.00
      </text>
      <text x={512} y={260} className="fill-mute text-[9.5px] font-mono">
        &rarr;
      </text>
      <text x={530} y={260} className="fill-accent text-[9.5px] font-mono">
        2.40
      </text>

      <rect x={382} y={286} width={348} height={62} rx={6} strokeWidth={1.5} className="fill-canvas stroke-hairline" />
      <text x={398} y={308} className="fill-ink text-[9.5px] font-medium">
        why it matters
      </text>
      <text x={398} y={326} className="fill-body-mid text-[9.5px]">
        refusal thresholds, agent confidence, and judges read probabilities.
      </text>
      <text x={398} y={340} className="fill-accent text-[9.5px] font-mono">
        0.96 was really 0.86 &mdash; T rescales, never reorders
      </text>
    </svg>
  );
}
