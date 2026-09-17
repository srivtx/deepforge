import type { PaperVisual } from "@/data/papers/types";
import type { ReactElement, ReactNode } from "react";

/**
 * Training-family paper figures: RL post-training loops, distillation, proof
 * search, FIM data pipelines, scaling laws, cost comparisons, the era
 * timeline, and the Janus decoupling diagram.
 *
 * Every figure is a single, self-contained <svg> that renders identically on
 * the server and the client: no hooks, no randomness, no clocks. Styling uses
 * design-system tokens only; ink stays low (hairline frames, one or two accent
 * strokes, warning reserved for failed / costly paths).
 */

/* ── Shared helpers ────────────────────────────────────────────────────── */

const SIZE = {
  7: "text-[7px]",
  8: "text-[8px]",
  9: "text-[9px]",
  10: "text-[10px]",
  11: "text-[11px]",
} as const;

type Size = keyof typeof SIZE;

type Tone = "ink" | "body" | "body-mid" | "mute" | "accent" | "warning";

const TONE: Record<Tone, string> = {
  ink: "text-ink",
  body: "text-body",
  "body-mid": "text-body-mid",
  mute: "text-mute",
  accent: "fill-accent",
  warning: "fill-warning",
};

function Label({
  x,
  y,
  children,
  tone = "ink",
  size = 9,
  anchor = "start",
  mono = false,
}: {
  x: number;
  y: number;
  children: ReactNode;
  tone?: Tone;
  size?: Size;
  anchor?: "start" | "middle" | "end";
  mono?: boolean;
}) {
  return (
    <text
      x={x}
      y={y}
      textAnchor={anchor}
      fill="currentColor"
      className={`${TONE[tone]} ${SIZE[size]} ${mono ? "font-mono" : "font-medium"}`}
    >
      {children}
    </text>
  );
}

function Node({
  x,
  y,
  width,
  height,
  title,
  sub,
  tone = "hairline",
  tint = false,
  dashed = false,
  center = false,
  titleTone = "ink",
  titleSize = 9,
}: {
  x: number;
  y: number;
  width: number;
  height: number;
  title: string;
  sub?: string | string[];
  tone?: "hairline" | "mid" | "accent";
  tint?: boolean;
  dashed?: boolean;
  center?: boolean;
  titleTone?: Tone;
  titleSize?: Size;
}) {
  const stroke = {
    hairline: "stroke-hairline",
    mid: "stroke-body-mid",
    accent: "stroke-accent",
  }[tone];
  const cx = center ? x + width / 2 : x + 9;
  const anchor = center ? "middle" : "start";
  const subs = typeof sub === "string" ? [sub] : (sub ?? []);
  const titleY =
    subs.length === 0
      ? y + height / 2 + 3
      : subs.length === 1
        ? y + height / 2 - 1
        : y + height / 2 - 6;
  return (
    <g>
      {tint ? (
        <rect
          x={x}
          y={y}
          width={width}
          height={height}
          rx={7}
          className="fill-accent"
          opacity={0.1}
        />
      ) : null}
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        rx={7}
        fill="none"
        strokeWidth={1.2}
        strokeDasharray={dashed ? "4 3" : undefined}
        className={stroke}
      />
      <Label x={cx} y={titleY} anchor={anchor} tone={titleTone} size={titleSize}>
        {title}
      </Label>
      {subs.map((line, i) => (
        <Label
          key={line}
          x={cx}
          y={titleY + 12 + i * 10}
          anchor={anchor}
          tone="body-mid"
          size={8}
        >
          {line}
        </Label>
      ))}
    </g>
  );
}

function ArrowMarker({
  id,
  tone = "mid",
}: {
  id: string;
  tone?: "mid" | "accent";
}) {
  return (
    <marker
      id={id}
      viewBox="0 0 10 10"
      refX="8"
      refY="5"
      markerWidth="5"
      markerHeight="5"
      orient="auto"
    >
      <path
        d="M0 0 10 5 0 10z"
        className={tone === "accent" ? "fill-accent" : "fill-body-mid"}
      />
    </marker>
  );
}

function Arrow({
  d,
  marker,
  tone = "mid",
  dashed = false,
}: {
  d: string;
  marker: string;
  tone?: "mid" | "accent" | "hairline";
  dashed?: boolean;
}) {
  const stroke = {
    mid: "stroke-body-mid",
    accent: "stroke-accent",
    hairline: "stroke-hairline",
  }[tone];
  return (
    <path
      d={d}
      fill="none"
      strokeWidth={1.3}
      strokeDasharray={dashed ? "3 3" : undefined}
      markerEnd={`url(#${marker})`}
      className={stroke}
    />
  );
}

function Axis({
  x1,
  y1,
  x2,
  y2,
  ticks = [],
  horizontal = true,
}: {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  ticks?: number[];
  horizontal?: boolean;
}) {
  return (
    <g>
      <line
        x1={x1}
        y1={y1}
        x2={x2}
        y2={y2}
        strokeWidth={1}
        className="stroke-hairline"
      />
      {ticks.map((t) => (
        <line
          key={t}
          x1={horizontal ? t : x1}
          y1={horizontal ? y1 : t}
          x2={horizontal ? t : x1 - 3}
          y2={horizontal ? y1 + 3 : t}
          strokeWidth={1}
          className="stroke-hairline"
        />
      ))}
    </g>
  );
}

function Check({ x, y, size = 10 }: { x: number; y: number; size?: number }) {
  const s = size / 10;
  return (
    <path
      d={`M${x} ${y + 5.5 * s} L${x + 3.5 * s} ${y + 9 * s} L${x + 10 * s} ${y + 1 * s}`}
      fill="none"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="stroke-accent"
    />
  );
}

function Cross({ x, y, size = 10 }: { x: number; y: number; size?: number }) {
  const s = size / 10;
  return (
    <g>
      <rect
        x={x + 4.2 * s}
        y={y}
        width={1.6 * s}
        height={10 * s}
        rx={0.8 * s}
        transform={`rotate(45 ${x + 5 * s} ${y + 5 * s})`}
        className="fill-warning"
      />
      <rect
        x={x + 4.2 * s}
        y={y}
        width={1.6 * s}
        height={10 * s}
        rx={0.8 * s}
        transform={`rotate(-45 ${x + 5 * s} ${y + 5 * s})`}
        className="fill-warning"
      />
    </g>
  );
}

/* ── 1. GRPO loop ──────────────────────────────────────────────────────── */

function GrpoLoop(): ReactElement {
  return (
    <svg viewBox="0 0 360 200" className="h-full w-full" aria-hidden="true">
      <defs>
        <ArrowMarker id="tfg-mid" />
        <ArrowMarker id="tfg-acc" tone="accent" />
      </defs>

      <Node x={16} y={22} width={104} height={36} title="policy" sub="sample a group of k" />
      {[0, 1, 2, 3].map((i) => (
        <g key={i}>
          <Node
            x={16 + i * 26}
            y={76}
            width={22}
            height={18}
            title={`o${i + 1}`}
            center
            titleSize={8}
          />
          <Node
            x={16 + i * 26}
            y={100}
            width={22}
            height={16}
            title={`r${i + 1}`}
            center
            titleSize={8}
          />
          <Arrow d={`M${27 + i * 26} 94 V98`} marker="tfg-mid" />
          <Arrow d={`M68 58 V66 H${27 + i * 26} V74`} marker="tfg-mid" />
        </g>
      ))}
      <Label x={16} y={128} tone="mute" size={7}>
        rewards
      </Label>

      <Arrow d="M120 108 H144" marker="tfg-mid" />

      <rect x={146} y={42} width={120} height={72} rx={7} className="fill-accent" opacity={0.1} />
      <rect
        x={146}
        y={42}
        width={120}
        height={72}
        rx={7}
        fill="none"
        strokeWidth={1.2}
        className="stroke-accent"
      />
      <Label x={206} y={66} anchor="middle" tone="ink">
        group-relative step
      </Label>
      <Label x={206} y={85} anchor="middle" tone="accent" size={8} mono>
        A = (r − mean) / std
      </Label>
      <Label x={206} y={100} anchor="middle" tone="body-mid" size={7}>
        no critic
      </Label>
      <Label x={206} y={111} anchor="middle" tone="body-mid" size={7}>
        no reward model
      </Label>

      <Arrow d="M206 114 V134" marker="tfg-acc" tone="accent" />
      <Node
        x={146}
        y={138}
        width={120}
        height={38}
        title="policy update"
        sub="θ ← θ + α·∇ log π·A"
        center
      />

      <Arrow
        d="M266 157 H282 Q292 157 292 147 V17 Q292 7 282 7 H84 Q72 7 72 17 V19"
        marker="tfg-mid"
      />
      <Label x={206} y={16} anchor="middle" tone="mute" size={7}>
        resample
      </Label>
    </svg>
  );
}

/* ── 2. RL reward curve ────────────────────────────────────────────────── */

const RL_X = [36, 60, 84, 108, 132, 156, 180, 204, 228, 252, 276, 300, 324];
const RL_Y = [138, 126, 112, 100, 92, 84, 82, 85, 81, 83, 80, 82, 81];

function RlRewardCurve(): ReactElement {
  const line = RL_X.map((x, i) => `${x},${RL_Y[i]}`).join(" ");
  const top = RL_X.slice(5).map((x, i) => `L${x} ${RL_Y[i + 5] - 5}`);
  const bottom = RL_X.slice(5)
    .map((x, i) => `L${x} ${RL_Y[i + 5] + 5}`)
    .reverse();
  const band = `M${RL_X[5]} ${RL_Y[5] - 5} ${top.slice(1).join(" ")} ${bottom.join(" ")} Z`;
  return (
    <svg viewBox="0 0 360 200" className="h-full w-full" aria-hidden="true">
      <Axis x1={36} y1={160} x2={336} y2={160} ticks={[96, 156, 216, 276]} />
      <Axis x1={36} y1={160} x2={36} y2={22} ticks={[124, 88, 52]} horizontal={false} />

      <path d={band} className="fill-accent" opacity={0.14} />
      <polyline points={line} fill="none" strokeWidth={1.7} className="stroke-accent" />

      <line
        x1={156}
        y1={84}
        x2={156}
        y2={40}
        strokeDasharray="3 3"
        strokeWidth={1}
        className="stroke-hairline"
      />
      <Label x={160} y={38} tone="body-mid" size={8}>
        plateau
      </Label>
      <Label x={40} y={154} tone="mute" size={8}>
        rapid gains
      </Label>

      <Label x={36} y={16} tone="body-mid" size={8}>
        reward
      </Label>
      <Label x={336} y={176} anchor="end" tone="body-mid" size={8}>
        training steps
      </Label>
      <Label x={36} y={178} tone="accent" size={8}>
        no reward model needed
      </Label>
    </svg>
  );
}

/* ── 3. Distillation flow ──────────────────────────────────────────────── */

const TRACES = [true, false, true];

function DistillationFlow(): ReactElement {
  return (
    <svg viewBox="0 0 360 200" className="h-full w-full" aria-hidden="true">
      <defs>
        <ArrowMarker id="tfd-mid" />
      </defs>

      <Node x={16} y={18} width={116} height={36} title="teacher" sub="long reasoning traces" />

      <path d="M74 54 V62 H6" fill="none" strokeWidth={1.3} className="stroke-body-mid" />
      <path d="M6 62 V148" fill="none" strokeWidth={1.3} className="stroke-body-mid" />

      {TRACES.map((pass, i) => {
        const y = 72 + i * 32;
        return (
          <g key={y}>
            <Arrow d={`M6 ${y + 12} H13`} marker="tfd-mid" />
            <rect
              x={16}
              y={y}
              width={150}
              height={24}
              rx={6}
              fill="none"
              strokeWidth={1.2}
              className="stroke-hairline"
            />
            {[0, 1, 2, 3, 4].map((d) => (
              <circle key={d} cx={30 + d * 16} cy={y + 12} r={2.2} className="fill-body-mid" />
            ))}
            <circle cx={116} cy={y + 12} r={2.8} className="fill-accent" />
            {pass ? <Check x={176} y={y + 7} /> : <Cross x={176} y={y + 6} size={12} />}
          </g>
        );
      })}
      <Label x={170} y={64} tone="mute" size={7}>
        filter
      </Label>

      <Arrow d="M168 84 H200 Q212 84 212 92 V100 H226" marker="tfd-mid" />
      <Arrow d="M168 148 H200 Q212 148 212 140 V132 H226" marker="tfd-mid" />
      <Arrow d="M168 116 H196 V162" marker="tfd-mid" />
      <Cross x={190} y={166} size={12} />
      <Label x={208} y={177} tone="body-mid" size={7}>
        filtered out
      </Label>

      <Node
        x={232}
        y={80}
        width={112}
        height={72}
        title="student"
        sub={["trains on verified", "traces only"]}
        tone="accent"
        tint
        center
      />
    </svg>
  );
}

/* ── 4. Prover search tree ─────────────────────────────────────────────── */

function ProverTree(): ReactElement {
  return (
    <svg viewBox="0 0 360 200" className="h-full w-full" aria-hidden="true">
      <defs>
        <ArrowMarker id="tfp-mid" />
        <ArrowMarker id="tfp-acc" tone="accent" />
      </defs>

      <Node x={142} y={14} width={76} height={28} title="main goal" center titleSize={8} />

      <Arrow d="M152 42 Q116 56 92 68" marker="tfp-mid" dashed />
      <Arrow d="M208 42 Q244 56 268 68" marker="tfp-mid" />
      <Node x={56} y={74} width={68} height={26} title="attempt" center titleSize={8} />
      <Node x={238} y={74} width={68} height={26} title="split" center titleSize={8} />
      <Label x={340} y={58} anchor="end" tone="accent" size={7}>
        decompose
      </Label>
      <Arrow d="M286 56 Q272 58 264 66" marker="tfp-acc" tone="accent" />

      <Arrow d="M88 100 V133" marker="tfp-mid" dashed />
      <circle cx={88} cy={146} r={11} fill="none" strokeWidth={1.2} className="stroke-body-mid" />
      <Cross x={82} y={140} size={12} />

      <Arrow d="M272 100 V112 H200 V131" marker="tfp-acc" tone="accent" />
      <Arrow d="M272 100 V131" marker="tfp-acc" tone="accent" />
      <circle cx={200} cy={146} r={11} fill="none" strokeWidth={1.2} className="stroke-accent" />
      <Check x={194} y={140} size={12} />
      <circle cx={276} cy={146} r={11} fill="none" strokeWidth={1.2} className="stroke-accent" />
      <Check x={270} y={140} size={12} />
      <Label x={238} y={124} anchor="middle" tone="accent" size={7}>
        subgoals
      </Label>

      <Label x={88} y={176} anchor="middle" tone="warning" size={8}>
        no proof
      </Label>
      <Label x={238} y={176} anchor="middle" tone="accent" size={8}>
        verified
      </Label>
    </svg>
  );
}

/* ── 5. Fill-in-the-middle pipeline ────────────────────────────────────── */

function CodePipeline(): ReactElement {
  return (
    <svg viewBox="0 0 360 200" className="h-full w-full" aria-hidden="true">
      <defs>
        <ArrowMarker id="tfc-mid" />
        <ArrowMarker id="tfc-acc" tone="accent" />
      </defs>

      <Node x={16} y={56} width={104} height={40} title="prefix" sub="context" center />
      <Node
        x={128}
        y={56}
        width={104}
        height={40}
        title="hole"
        sub="predict this"
        tone="accent"
        tint
        dashed
        center
      />
      <Node x={240} y={56} width={104} height={40} title="suffix" sub="context" center />
      <Label x={124} y={80} anchor="middle" tone="mute" size={10}>
        |
      </Label>
      <Label x={236} y={80} anchor="middle" tone="mute" size={10}>
        |
      </Label>

      <Label x={68} y={46} anchor="middle" tone="body-mid" size={7}>
        prefix span
      </Label>
      <Label x={180} y={46} anchor="middle" tone="accent" size={7}>
        hole span
      </Label>
      <Label x={292} y={46} anchor="middle" tone="body-mid" size={7}>
        suffix span
      </Label>

      <Arrow d="M68 96 V110 Q68 118 78 118 H100" marker="tfc-mid" />
      <Arrow d="M292 96 V110 Q292 118 282 118 H260" marker="tfc-mid" />
      <Node x={104} y={124} width={152} height={34} title="decoder" sub="sees both sides" center />
      <Arrow d="M180 158 V166" marker="tfc-acc" tone="accent" />
      <Label x={180} y={180} anchor="middle" tone="accent" size={8}>
        fills the hole
      </Label>
    </svg>
  );
}

/* ── 6. Scaling curve with extrapolation ───────────────────────────────── */

const SCALE_X = [40, 76, 112, 148, 184, 220, 256];
const LOSS_A = [50, 74, 94, 108, 117, 123, 127];
const LOSS_B = [38, 64, 86, 101, 111, 118, 122];

function ScalingCurve(): ReactElement {
  return (
    <svg viewBox="0 0 360 200" className="h-full w-full" aria-hidden="true">
      <Axis x1={34} y1={158} x2={336} y2={158} ticks={[90, 146, 202, 258, 314]} />
      <Axis x1={34} y1={158} x2={34} y2={20} ticks={[124, 90, 56]} horizontal={false} />

      <polyline
        points={SCALE_X.map((x, i) => `${x},${LOSS_B[i]}`).join(" ")}
        fill="none"
        strokeWidth={1.3}
        className="stroke-body-mid"
      />
      <polyline
        points={SCALE_X.map((x, i) => `${x},${LOSS_A[i]}`).join(" ")}
        fill="none"
        strokeWidth={1.7}
        className="stroke-accent"
      />
      <path
        d={`M256 ${LOSS_A[6]} L292 130 L322 133`}
        fill="none"
        strokeWidth={1.5}
        strokeDasharray="4 3"
        className="stroke-accent"
      />

      <line
        x1={256}
        y1={127}
        x2={256}
        y2={34}
        strokeDasharray="3 3"
        strokeWidth={1}
        className="stroke-hairline"
      />
      <Label x={252} y={30} anchor="end" tone="mute" size={7}>
        now
      </Label>
      <Label x={336} y={144} anchor="end" tone="body-mid" size={7}>
        extrapolated
      </Label>
      <Label x={44} y={132} tone="accent" size={8}>
        power-law fit
      </Label>
      <Label x={44} y={144} tone="body-mid" size={8} mono>
        L = a · N^-b
      </Label>

      <Label x={34} y={14} tone="body-mid" size={8}>
        loss
      </Label>
      <Label x={336} y={174} anchor="end" tone="body-mid" size={8}>
        params (log)
      </Label>
    </svg>
  );
}

/* ── 7. Relative training cost bars ────────────────────────────────────── */

function CostBars(): ReactElement {
  return (
    <svg viewBox="0 0 360 200" className="h-full w-full" aria-hidden="true">
      <Label x={24} y={42} tone="ink" size={9}>
        sparse MoE
      </Label>
      <Label x={24} y={54} tone="body-mid" size={7}>
        few experts active per token
      </Label>
      <rect x={24} y={62} width={170} height={14} rx={3} className="fill-body-mid" opacity={0.5} />
      <Label x={198} y={73} tone="body-mid" size={8}>
        lower cost
      </Label>

      <Label x={24} y={102} tone="ink" size={9}>
        dense model
      </Label>
      <Label x={24} y={114} tone="body-mid" size={7}>
        every parameter active
      </Label>
      <rect x={24} y={122} width={294} height={14} rx={3} className="fill-warning" opacity={0.75} />
      <Label x={318} y={116} anchor="end" tone="warning" size={8}>
        higher cost
      </Label>

      <line
        x1={194}
        y1={56}
        x2={194}
        y2={152}
        strokeDasharray="3 3"
        strokeWidth={1}
        className="stroke-hairline"
      />
      <Label x={198} y={148} tone="body-mid" size={7}>
        fewer active params
      </Label>

      <line x1={24} y1={152} x2={336} y2={152} strokeWidth={1} className="stroke-hairline" />
      <line x1={24} y1={152} x2={24} y2={149} strokeWidth={1} className="stroke-hairline" />
      <line x1={336} y1={152} x2={336} y2={149} strokeWidth={1} className="stroke-hairline" />
      <Label x={336} y={170} anchor="end" tone="mute" size={8}>
        relative training cost, qualitative
      </Label>
    </svg>
  );
}

/* ── 8. Era timeline ───────────────────────────────────────────────────── */

const ERAS: Array<{ x: number; name: string; note: string; above: boolean }> = [
  { x: 68, name: "founding", note: "first models", above: true },
  { x: 152, name: "efficiency", note: "cheaper training", above: false },
  { x: 236, name: "reasoning", note: "rl post-training", above: true },
  { x: 316, name: "frontier", note: "current edge", above: false },
];

function Timeline(): ReactElement {
  return (
    <svg viewBox="0 0 360 200" className="h-full w-full" aria-hidden="true">
      <defs>
        <ArrowMarker id="tft-mid" />
      </defs>

      <Arrow d="M24 112 H340" marker="tft-mid" />

      {ERAS.map((era) => (
        <g key={era.name}>
          <line
            x1={era.x}
            y1={112}
            x2={era.x}
            y2={era.above ? 106 : 118}
            strokeWidth={1}
            className="stroke-hairline"
          />
          <circle cx={era.x} cy={112} r={3.5} className="fill-body-mid" />
          <Label
            x={era.x}
            y={era.above ? 94 : 136}
            anchor="middle"
            tone="ink"
            size={9}
          >
            {era.name}
          </Label>
          <Label
            x={era.x}
            y={era.above ? 84 : 148}
            anchor="middle"
            tone="body-mid"
            size={7}
          >
            {era.note}
          </Label>
        </g>
      ))}
      <circle cx={316} cy={112} r={3.5} className="fill-accent" />
      <Label x={340} y={96} anchor="end" tone="mute" size={7}>
        time
      </Label>
    </svg>
  );
}

/* ── 9. Janus encoder decoupling ───────────────────────────────────────── */

function JanusDecouple(): ReactElement {
  return (
    <svg viewBox="0 0 360 200" className="h-full w-full" aria-hidden="true">
      <defs>
        <ArrowMarker id="tfj-mid" />
      </defs>

      <Label x={188} y={18} anchor="middle" tone="accent" size={9}>
        decoupled at the edges
      </Label>
      <line
        x1={158}
        y1={26}
        x2={158}
        y2={176}
        strokeDasharray="3 3"
        strokeWidth={1}
        className="stroke-hairline"
      />

      <Node
        x={16}
        y={30}
        width={118}
        height={42}
        title="understanding"
        sub="encoder · semantics"
        center
        titleSize={8}
      />
      <Node
        x={16}
        y={128}
        width={118}
        height={42}
        title="generation"
        sub="encoder · image tokens"
        center
        titleSize={8}
      />

      <Arrow d="M134 51 H164 Q176 51 176 63 V94 Q176 106 186 106" marker="tfj-mid" />
      <Arrow d="M134 149 H164 Q176 149 176 137 V118 Q176 106 186 106" marker="tfj-mid" />

      <Node
        x={190}
        y={76}
        width={150}
        height={60}
        title="shared transformer"
        sub={["one core for both", "modalities"]}
        tone="accent"
        tint
        center
        titleSize={9}
      />

      <Label x={188} y={188} anchor="middle" tone="mute" size={7}>
        one core, two input paths
      </Label>
    </svg>
  );
}

/* ── Registry ──────────────────────────────────────────────────────────── */

export const TRAINING_FIGURES: Partial<Record<PaperVisual, () => ReactElement>> = {
  "grpo-loop": GrpoLoop,
  "rl-reward-curve": RlRewardCurve,
  "distillation-flow": DistillationFlow,
  "prover-tree": ProverTree,
  "code-pipeline": CodePipeline,
  "scaling-curve": ScalingCurve,
  "cost-bars": CostBars,
  timeline: Timeline,
  "janus-decouple": JanusDecouple,
};
