function sigmoid(x: number): number {
  return 1 / (1 + Math.exp(-x));
}

const CURVE_X0 = 62;
const CURVE_X1 = 312;
const CURVE_TOP = 250;
const CURVE_BOTTOM = 352;

function curvePoint(t: number): [number, number] {
  const px = CURVE_X0 + ((t + 4) / 8) * (CURVE_X1 - CURVE_X0);
  const py = CURVE_BOTTOM - sigmoid(t) * (CURVE_BOTTOM - CURVE_TOP);
  return [px, py];
}

const CURVE_PATH = Array.from({ length: 65 }, (_, i) => {
  const [x, y] = curvePoint(-4 + i * 0.125);
  return `${i === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`;
}).join(" ");

const CURVE_DOTS = [-2, 0, 2].map((t) => {
  const [x, y] = curvePoint(t);
  return { t, x, y };
});

interface StageProps {
  x: number;
  title: string;
  sub: string;
  lines: [string, string];
  accent?: boolean;
}

function Stage({ x, title, sub, lines, accent }: StageProps) {
  return (
    <g>
      <rect
        x={x}
        y={70}
        width={206}
        height={132}
        rx={8}
        strokeWidth={1.5}
        className={accent ? "fill-accent/5 stroke-accent/40" : "fill-canvas stroke-hairline"}
      />
      <text x={x + 16} y={96} className={accent ? "fill-accent text-[12.5px] font-medium" : "fill-ink text-[12.5px] font-medium"}>
        {title}
      </text>
      <text x={x + 16} y={114} className="fill-body-mid text-[9.5px] font-mono">
        {sub}
      </text>
      <text x={x + 16} y={140} className="fill-body-mid text-[9.5px]">
        {lines[0]}
      </text>
      <text x={x + 16} y={158} className="fill-body-mid text-[9.5px]">
        {lines[1]}
      </text>
    </g>
  );
}

export function PostTrainingPipeline() {
  return (
    <svg
      viewBox="0 0 760 380"
      role="img"
      aria-labelledby="posttrain-title posttrain-desc"
      className="h-auto w-full"
    >
      <title id="posttrain-title">
        SFT to preference optimization to verifiable-reward RL, with the critic removed
      </title>
      <desc id="posttrain-desc">
        Three post-training stages in sequence. First supervised fine-tuning on
        demonstrations, which teaches format but carries no preference signal.
        Second preference optimization with DPO, scoring chosen and rejected
        pairs and staying close to a reference policy through beta. Third
        reinforcement learning from verifiable rewards with GRPO, where a
        checker returns zero or one and the group mean becomes the baseline.
        A critic box inside the third stage is crossed out, because GRPO uses
        group-relative advantage instead. A Bradley-Terry curve below maps the
        reward difference to the probability that one response is preferred.
      </desc>
      <defs>
        <marker
          id="posttrain-arrow"
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

      <text x={30} y={28} className="fill-ink text-[12.5px] font-medium">
        SFT teaches format &middot; preferences teach choice &middot; verifiable rewards teach reasoning
      </text>
      <text x={30} y={44} className="fill-mute text-[9.5px] font-mono">
        pretraining gives the model language; post-training gives it behavior
      </text>

      <Stage
        x={36}
        title="1 &middot; SFT"
        sub="supervised fine-tuning"
        lines={["next-token loss on demonstrations", "imitates; never compares"]}
      />
      <Stage
        x={277}
        title="2 &middot; preference optimization"
        sub="DPO &middot; or PPO with a reward model"
        lines={["chosen vs rejected pairs", "reference anchor: \u03B2 \u00B7 KL"]}
      />
      <Stage
        x={518}
        title="3 &middot; RLVR"
        sub="GRPO &middot; group-relative advantage"
        lines={["checker returns 0 / 1", "no reward model, no value net"]}
        accent
      />

      <path d="M242 136H269" fill="none" strokeWidth={1.5} markerEnd="url(#posttrain-arrow)" className="stroke-body-mid" />
      <text x={255} y={126} textAnchor="middle" className="fill-mute text-[9px] font-mono">
        (y&#119908;, y&#8467;)
      </text>
      <path d="M483 136H510" fill="none" strokeWidth={1.5} markerEnd="url(#posttrain-arrow)" className="stroke-body-mid" />
      <text x={496} y={126} textAnchor="middle" className="fill-mute text-[9px] font-mono">
        rewards
      </text>

      <rect x={620} y={162} width={88} height={26} rx={5} strokeWidth={1.25} className="fill-canvas stroke-error/50" />
      <text x={664} y={179} textAnchor="middle" className="fill-error text-[9.5px] font-mono">
        critic
      </text>
      <line x1={616} y1={186} x2={712} y2={164} strokeWidth={1.5} className="stroke-error" />

      <text x={36} y={232} className="fill-ink text-[11px] font-medium">
        Bradley&ndash;Terry: the preference model in one curve
      </text>
      <line x1={CURVE_X0} y1={CURVE_BOTTOM} x2={CURVE_X1} y2={CURVE_BOTTOM} className="stroke-hairline" />
      <line x1={CURVE_X0} y1={CURVE_TOP} x2={CURVE_X0} y2={CURVE_BOTTOM} className="stroke-hairline" />
      <path d={CURVE_PATH} fill="none" strokeWidth={1.5} className="stroke-accent" />
      {CURVE_DOTS.map((dot) => (
        <circle key={dot.t} cx={dot.x} cy={dot.y} r={3.5} className="fill-warning" />
      ))}
      <text x={CURVE_X1} y={CURVE_BOTTOM + 16} textAnchor="end" className="fill-mute text-[9px] font-mono">
        r&#119908; &minus; r&#8467;
      </text>
      <text x={CURVE_X0 - 8} y={CURVE_TOP + 4} textAnchor="end" className="fill-mute text-[9px] font-mono">
        1.0
      </text>
      <text x={CURVE_X0 - 8} y={CURVE_BOTTOM + 3} textAnchor="end" className="fill-mute text-[9px] font-mono">
        0.0
      </text>
      <text x={CURVE_X0 + 8} y={CURVE_TOP + 18} className="fill-accent text-[9.5px] font-mono">
        P(y&#119908; &#8827; y&#8467;) = &sigma;(r&#119908; &minus; r&#8467;)
      </text>

      <line x1={352} y1={238} x2={352} y2={362} className="stroke-hairline" />

      <text x={376} y={250} className="fill-ink text-[10.5px] font-medium">
        what changed by 2026
      </text>
      <text x={376} y={272} className="fill-body-mid text-[9.5px]">
        DPO matches PPO within ~0.3 MT-Bench at ~10&times; less compute
      </text>
      <text x={376} y={290} className="fill-body-mid text-[9.5px]">
        GRPO drops the critic; DAPO and GSPO stabilize it
      </text>
      <text x={376} y={308} className="fill-body-mid text-[9.5px]">
        RLVR works where a checker can grade: math, code, tools
      </text>
      <text x={376} y={326} className="fill-warning text-[9.5px]">
        ranking inverts across scale &mdash; measure where you deploy
      </text>
      <text x={376} y={350} className="fill-accent text-[9.5px] font-mono">
        &pi;&#952; kept close to &pi;ref by &beta; &middot; reward hacking bounded
      </text>
    </svg>
  );
}
