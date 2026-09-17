import type { PaperVisual } from "@/data/papers/types";
import type { ReactElement, ReactNode } from "react";

/**
 * Architecture-family paper figures: mixture-of-experts routing and
 * granularity, latent attention, fp8 range, load balancing, multi-token
 * prediction, sparse attention, hybrid reasoning, and the vision tower.
 *
 * Every figure is a single, self-contained <svg> that renders identically on
 * the server and the client: no hooks, no randomness, no clocks. Styling uses
 * design-system tokens only; ink stays low (hairline frames, one or two accent
 * strokes, warning reserved for the unbalanced / failure side).
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

const TEXT_TONE: Record<Tone, string> = {
  ink: "text-ink",
  body: "text-body",
  "body-mid": "text-body-mid",
  mute: "text-mute",
  accent: "text-accent",
  warning: "text-warning",
};

const FILL_TONE: Record<Tone, string> = {
  ink: "fill-ink",
  body: "fill-body",
  "body-mid": "fill-body-mid",
  mute: "fill-mute",
  accent: "fill-accent",
  warning: "fill-warning",
};

type StrokeTone = "hairline" | "mid" | "accent";

const STROKE: Record<StrokeTone, string> = {
  hairline: "stroke-hairline",
  mid: "stroke-body-mid",
  accent: "stroke-accent",
};

function Label({
  x,
  y,
  children,
  tone = "body-mid",
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
      className={`${TEXT_TONE[tone]} ${SIZE[size]}${mono ? " font-mono" : ""}`}
    >
      {children}
    </text>
  );
}

/** Hairline frame; `tint` adds a very light accent wash behind it. */
function Node({
  x,
  y,
  width,
  height,
  rx = 6,
  tone = "hairline",
  lineWidth = 1.2,
  dashed = false,
  tint = false,
}: {
  x: number;
  y: number;
  width: number;
  height: number;
  rx?: number;
  tone?: StrokeTone;
  lineWidth?: number;
  dashed?: boolean;
  tint?: boolean;
}) {
  return (
    <g>
      {tint ? (
        <rect
          x={x}
          y={y}
          width={width}
          height={height}
          rx={rx}
          className="fill-accent"
          opacity={0.1}
        />
      ) : null}
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        rx={rx}
        fill="none"
        strokeWidth={lineWidth}
        strokeDasharray={dashed ? "3 3" : undefined}
        className={STROKE[tone]}
      />
    </g>
  );
}

function Bar({
  x,
  y,
  width,
  height,
  tone = "accent",
  opacity = 0.8,
  rx = 1.5,
}: {
  x: number;
  y: number;
  width: number;
  height: number;
  tone?: Tone;
  opacity?: number;
  rx?: number;
}) {
  return (
    <rect
      x={x}
      y={y}
      width={width}
      height={height}
      rx={rx}
      className={FILL_TONE[tone]}
      opacity={opacity}
    />
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
  width = 1.2,
  dashed = false,
}: {
  d: string;
  marker: string;
  tone?: StrokeTone;
  width?: number;
  dashed?: boolean;
}) {
  return (
    <path
      d={d}
      fill="none"
      strokeWidth={width}
      strokeDasharray={dashed ? "3 3" : undefined}
      markerEnd={`url(#${marker})`}
      className={STROKE[tone]}
    />
  );
}

function Axis({
  x1,
  y1,
  x2,
  y2,
  tone = "hairline",
  width = 1,
  dashed = false,
}: {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  tone?: StrokeTone;
  width?: number;
  dashed?: boolean;
}) {
  return (
    <line
      x1={x1}
      y1={y1}
      x2={x2}
      y2={y2}
      strokeWidth={width}
      strokeDasharray={dashed ? "3 3" : undefined}
      className={STROKE[tone]}
    />
  );
}

/** Tick mark centered on a horizontal axis. */
function Tick({
  x,
  y,
  half = 4,
  tone = "accent",
  width = 1,
}: {
  x: number;
  y: number;
  half?: number;
  tone?: StrokeTone;
  width?: number;
}) {
  return (
    <line
      x1={x}
      y1={y - half}
      x2={x}
      y2={y + half}
      strokeWidth={width}
      className={STROKE[tone]}
    />
  );
}

/* ── 1. MoE routing: token → gate → top-3 of N experts ─────────────────── */

function MoeRouting(): ReactElement {
  const tokens = [
    { id: "t1", y: 36, to: 62 },
    { id: "t2", y: 66, to: 75 },
    { id: "t3", y: 96, to: 88 },
  ];
  const experts = [
    { name: "expert 1", y: 12, active: true },
    { name: "expert 2", y: 48, active: false },
    { name: "expert 3", y: 84, active: true },
    { name: "expert 4", y: 120, active: false },
    { name: "expert 5", y: 156, active: true },
  ];
  const routes = [
    { d: "M112 75 H134 V23 H192", width: 2.4 },
    { d: "M112 75 H152 V95 H192", width: 1.5 },
    { d: "M112 75 H170 V167 H192", width: 0.8 },
  ];
  const weights = [
    { value: "0.52", width: 34, opacity: 0.9, y: 130 },
    { value: "0.31", width: 20, opacity: 0.6, y: 142 },
    { value: "0.17", width: 11, opacity: 0.35, y: 154 },
  ];
  return (
    <svg viewBox="0 0 360 200" className="h-full w-full" aria-hidden="true">
      <defs>
        <ArrowMarker id="afg-moe" tone="accent" />
      </defs>

      <Label x={16} y={18} tone="ink" size={10}>
        3 tokens · top-3 of N experts
      </Label>
      {tokens.map((token) => (
        <g key={token.id}>
          <Node x={16} y={token.y} width={28} height={18} rx={4} tone="mid" />
          <Label
            x={30}
            y={token.y + 12}
            anchor="middle"
            tone="body-mid"
            size={8}
          >
            {token.id}
          </Label>
          <line
            x1={44}
            y1={token.y + 9}
            x2={64}
            y2={token.to}
            strokeWidth={1}
            className="stroke-hairline"
          />
        </g>
      ))}

      <Label x={64} y={42} tone="mute" size={8}>
        gate
      </Label>
      <Node x={64} y={48} width={48} height={54} tone="accent" />
      <Label x={88} y={79} anchor="middle" tone="accent" size={10}>
        gate
      </Label>

      {routes.map((route) => (
        <Arrow
          key={route.d}
          d={route.d}
          marker="afg-moe"
          tone="accent"
          width={route.width}
        />
      ))}
      {experts.map((expert) => (
        <g key={expert.name}>
          {!expert.active ? (
            <line
              x1={176}
              y1={expert.y + 11}
              x2={192}
              y2={expert.y + 11}
              strokeWidth={1}
              strokeDasharray="2 3"
              className="stroke-hairline"
            />
          ) : null}
          <Node
            x={192}
            y={expert.y}
            width={150}
            height={22}
            rx={4}
            tone={expert.active ? "accent" : "hairline"}
            lineWidth={expert.active ? 1.4 : 1}
          />
          <Label
            x={202}
            y={expert.y + 15}
            tone={expert.active ? "accent" : "mute"}
            size={8}
          >
            {expert.name}
          </Label>
        </g>
      ))}

      <Label x={64} y={122} tone="mute" size={8}>
        gate weights
      </Label>
      {weights.map((weight) => (
        <g key={weight.value}>
          <Bar
            x={64}
            y={weight.y}
            width={weight.width}
            height={7}
            opacity={weight.opacity}
          />
          <Label
            x={64 + weight.width + 6}
            y={weight.y + 6}
            tone="mute"
            size={7}
            mono
          >
            {weight.value}
          </Label>
        </g>
      ))}
      <Label x={16} y={190} tone="body-mid" size={8}>
        wire thickness = gate weight · other experts stay idle
      </Label>
    </svg>
  );
}

/* ── 2. Coarse (2 experts) vs fine-grained (8 segments + 2 shared) ─────── */

function FineGrainedExperts(): ReactElement {
  const active = new Set([1, 3, 4, 6]);
  const segments = Array.from({ length: 8 }, (_, index) => ({
    index,
    x: 198 + index * 18.5,
    selected: active.has(index),
  }));
  return (
    <svg viewBox="0 0 360 200" className="h-full w-full" aria-hidden="true">
      <defs>
        <ArrowMarker id="afg-fge" />
      </defs>

      <Axis x1={182} y1={16} x2={182} y2={184} />

      <Label x={16} y={20} tone="ink" size={10}>
        coarse · 2 experts
      </Label>
      <Node x={16} y={30} width={73} height={30} rx={4} tone="mid" />
      <Node x={91} y={30} width={73} height={30} rx={4} tone="mid" />
      <Label x={52} y={49} anchor="middle" tone="body-mid" size={9}>
        expert 1
      </Label>
      <Label x={127} y={49} anchor="middle" tone="body-mid" size={9}>
        expert 2
      </Label>

      <Node x={16} y={84} width={20} height={16} rx={3} tone="mid" />
      <Node x={92} y={84} width={20} height={16} rx={3} tone="mid" />
      <Label x={26} y={96} anchor="middle" tone="body-mid" size={8}>
        t1
      </Label>
      <Label x={102} y={96} anchor="middle" tone="body-mid" size={8}>
        t2
      </Label>
      <Arrow d="M26 84 V72 H52 V64" marker="afg-fge" />
      <Arrow d="M102 84 V72 H127 V64" marker="afg-fge" />

      <Label x={16} y={126} tone="body-mid" size={8}>
        each token → 1 of 2 blocks
      </Label>
      <Label x={16} y={144} tone="mute" size={8}>
        experts generalize across domains
      </Label>
      <Label x={16} y={162} tone="body-mid" size={8}>
        granularity: 1 of 2
      </Label>

      <Label x={198} y={20} tone="ink" size={10}>
        fine-grained · 8 segments
      </Label>
      {segments.map((segment) => (
        <Node
          key={segment.index}
          x={segment.x}
          y={30}
          width={17.5}
          height={30}
          rx={3}
          tone="hairline"
          lineWidth={segment.selected ? 1.4 : 0.75}
          tint={segment.selected}
        />
      ))}

      <Node x={198} y={84} width={20} height={16} rx={3} tone="mid" />
      <Node x={288} y={84} width={20} height={16} rx={3} tone="mid" />
      <Label x={208} y={96} anchor="middle" tone="body-mid" size={8}>
        t1
      </Label>
      <Label x={298} y={96} anchor="middle" tone="body-mid" size={8}>
        t2
      </Label>
      <Arrow d="M208 84 V72 H225 V64" marker="afg-fge" />
      <Arrow d="M208 84 V78 H262 V64" marker="afg-fge" />
      <Arrow d="M298 84 V72 H281 V64" marker="afg-fge" />
      <Arrow d="M298 84 V78 H318 V64" marker="afg-fge" />

      <Node x={198} y={108} width={70} height={22} rx={4} tone="accent" />
      <Node x={276} y={108} width={70} height={22} rx={4} tone="accent" />
      <Label x={233} y={123} anchor="middle" tone="accent" size={8}>
        shared 1
      </Label>
      <Label x={311} y={123} anchor="middle" tone="accent" size={8}>
        shared 2
      </Label>

      <Label x={198} y={146} tone="accent" size={8}>
        always on · every token
      </Label>
      <Label x={198} y={164} tone="body-mid" size={8}>
        finer split, sharper experts
      </Label>
      <Label x={198} y={182} tone="mute" size={8}>
        more combinations per token
      </Label>
    </svg>
  );
}

/* ── 3. MLA: K/V → latent c → per-head K/V ─────────────────────────────── */

function MlaLatent(): ReactElement {
  return (
    <svg viewBox="0 0 360 200" className="h-full w-full" aria-hidden="true">
      <defs>
        <ArrowMarker id="afg-mla-down" tone="accent" />
        <ArrowMarker id="afg-mla-up" />
        <ArrowMarker id="afg-mla-head" />
      </defs>

      <Label x={16} y={20} tone="ink" size={10}>
        MLA: compress the KV cache
      </Label>

      <Node x={28} y={30} width={80} height={88} tone="mid" />
      <Label x={68} y={58} anchor="middle" tone="ink" size={11}>
        K V
      </Label>
      <Label x={68} y={78} anchor="middle" tone="body-mid" size={9} mono>
        d = 7168
      </Label>
      <Label x={68} y={94} anchor="middle" tone="mute" size={8}>
        per token
      </Label>

      <Arrow d="M48 118 V132" marker="afg-mla-down" tone="accent" width={1.4} />
      <Arrow d="M88 132 V118" marker="afg-mla-up" tone="mid" />
      <Label x={116} y={124} tone="body-mid" size={7}>
        down-proj
      </Label>
      <Label x={116} y={142} tone="mute" size={7}>
        up-proj
      </Label>

      <Node x={28} y={132} width={80} height={44} tone="accent" tint />
      <Label x={68} y={154} anchor="middle" tone="accent" size={10} mono>
        c = 512
      </Label>
      <Label x={68} y={168} anchor="middle" tone="mute" size={8}>
        latent
      </Label>

      <Axis x1={108} y1={156} x2={132} y2={156} tone="mid" />
      <Axis x1={132} y1={76} x2={132} y2={172} tone="mid" />
      {[76, 124, 172].map((y) => (
        <g key={y}>
          <Arrow
            d={`M132 ${y} H168`}
            marker="afg-mla-head"
            tone="mid"
            width={1.1}
          />
          <Node x={170} y={y - 12} width={64} height={24} rx={4} tone="mid" />
        </g>
      ))}
      <Label x={202} y={80} anchor="middle" tone="body-mid" size={8}>
        head 1
      </Label>
      <Label x={202} y={128} anchor="middle" tone="body-mid" size={8}>
        head 2
      </Label>
      <Label x={202} y={176} anchor="middle" tone="body-mid" size={8}>
        head 3
      </Label>

      <Axis x1={240} y1={64} x2={240} y2={184} tone="accent" width={1.2} />
      <Axis x1={234} y1={64} x2={246} y2={64} tone="accent" width={1.2} />
      <Axis x1={234} y1={184} x2={246} y2={184} tone="accent" width={1.2} />
      <Label x={252} y={128} tone="accent" size={8}>
        per-head 128
      </Label>

      <Label x={16} y={196} tone="body-mid" size={8}>
        store c = 512 per token · rebuild 128 per head · ~56× smaller cache
      </Label>
    </svg>
  );
}

/* ── 4. fp8 E4M3 / fp16 / bf16 ranges with a per-tile scale ────────────── */

function Fp8Range(): ReactElement {
  const fp8Ticks = [90, 130, 150, 160, 165, 167.5, 172.5, 175, 180, 190, 210, 250];
  return (
    <svg viewBox="0 0 360 200" className="h-full w-full" aria-hidden="true">
      <defs>
        <ArrowMarker id="afg-fp8" tone="accent" />
      </defs>

      <Label x={16} y={20} tone="ink" size={10}>
        float ranges around zero
      </Label>
      <Axis x1={170} y1={28} x2={170} y2={126} dashed />
      <Label x={170} y={24} anchor="middle" tone="mute" size={8} mono>
        0
      </Label>

      <Axis x1={96} y1={42} x2={318} y2={42} tone="accent" width={1.5} />
      <Label x={16} y={46} tone="accent" size={9}>
        fp8 E4M3
      </Label>
      {fp8Ticks.map((x) => (
        <Tick key={x} x={x} y={42} />
      ))}
      <Label x={322} y={46} tone="body-mid" size={9} mono>
        ±448
      </Label>

      <Axis x1={96} y1={78} x2={318} y2={78} tone="mid" width={1.5} />
      <Label x={16} y={82} tone="body-mid" size={9}>
        fp16
      </Label>
      {[162, 166, 170, 174, 178].map((x) => (
        <Tick key={x} x={x} y={78} tone="mid" />
      ))}
      <Label x={322} y={82} tone="mute" size={9} mono>
        ±65 504
      </Label>
      <Label x={196} y={72} tone="mute" size={7}>
        dense levels near 0
      </Label>

      <Axis x1={96} y1={114} x2={318} y2={114} tone="mid" width={1.5} />
      <Label x={16} y={118} tone="body-mid" size={9}>
        bf16
      </Label>
      {[164, 170, 176].map((x) => (
        <Tick key={x} x={x} y={114} tone="mid" />
      ))}
      <Label x={322} y={118} tone="mute" size={9} mono>
        ±3.4e38
      </Label>
      <Label x={196} y={108} tone="mute" size={7}>
        8-bit mantissa → coarser steps
      </Label>

      <Arrow d="M88 132 V50" marker="afg-fp8" tone="accent" width={1.2} />
      <Node x={16} y={132} width={328} height={54} tone="accent" />
      <Label x={30} y={154} tone="accent" size={10}>
        per-tile scale
      </Label>
      <Label x={30} y={172} tone="body-mid" size={8}>
        each 1×128 tile: amax mapped onto 448, one scale per tile
      </Label>
    </svg>
  );
}

/* ── 5. Load balance: histogram before vs after bias correction ────────── */

function LoadBalance(): ReactElement {
  const before = [62, 10, 54, 14, 40, 12, 46, 20];
  const after = [46, 42, 48, 40, 44, 41, 47, 43];
  const base = 144;
  return (
    <svg viewBox="0 0 360 200" className="h-full w-full" aria-hidden="true">
      <defs>
        <ArrowMarker id="afg-lb" />
        <ArrowMarker id="afg-lb-acc" tone="accent" />
      </defs>

      <Label x={12} y={20} tone="warning" size={10}>
        before
      </Label>
      <Label x={12} y={34} tone="mute" size={8}>
        traffic share per expert
      </Label>
      <Label x={188} y={20} tone="accent" size={10}>
        after
      </Label>
      <Label x={188} y={34} tone="mute" size={8}>
        dashed = uniform share
      </Label>

      <Axis x1={12} y1={base} x2={172} y2={base} />
      <Axis x1={188} y1={base} x2={348} y2={base} />
      <Axis x1={12} y1={100} x2={172} y2={100} dashed />
      <Axis x1={188} y1={100} x2={348} y2={100} dashed />

      {before.map((height, index) => (
        <Bar
          key={`b-${index}`}
          x={15 + index * 20}
          y={base - height}
          width={14}
          height={height}
          tone="warning"
          opacity={0.75}
          rx={1}
        />
      ))}
      {after.map((height, index) => (
        <Bar
          key={`a-${index}`}
          x={191 + index * 20}
          y={base - height}
          width={14}
          height={height}
          tone="accent"
          opacity={0.75}
          rx={1}
        />
      ))}

      <Arrow d="M22 72 V80" marker="afg-lb" width={1} />
      <Arrow d="M62 82 V88" marker="afg-lb" width={1} />
      <Arrow d="M42 143 V136" marker="afg-lb" width={1} />
      <Arrow d="M231 86 V94" marker="afg-lb-acc" tone="accent" width={1} />
      <Arrow d="M251 114 V106" marker="afg-lb-acc" tone="accent" width={1} />

      <Arrow d="M174 122 H185" marker="afg-lb" width={1.1} />
      <Label x={180} y={114} anchor="middle" tone="body-mid" size={8} mono>
        b_i
      </Label>

      {before.map((_, index) => (
        <Label
          key={`bi-${index}`}
          x={22 + index * 20}
          y={157}
          anchor="middle"
          tone="mute"
          size={7}
          mono
        >
          {index + 1}
        </Label>
      ))}
      {after.map((_, index) => (
        <Label
          key={`ai-${index}`}
          x={198 + index * 20}
          y={157}
          anchor="middle"
          tone="mute"
          size={7}
          mono
        >
          {index + 1}
        </Label>
      ))}

      <Label x={12} y={176} tone="warning" size={8}>
        max/min ≈ 6×
      </Label>
      <Label x={188} y={176} tone="accent" size={8}>
        max/min ≈ 1.2×
      </Label>
      <Label x={12} y={192} tone="body-mid" size={8}>
        b_i nudges gate scores: overloaded experts step down, idle ones up
      </Label>
    </svg>
  );
}

/* ── 6. MTP: one shared trunk, heads for t+1 and t+2 ───────────────────── */

function MtpTokens(): ReactElement {
  const tokens = ["t1", "t2", "t3", "t4", "t5", "t6"];
  return (
    <svg viewBox="0 0 360 200" className="h-full w-full" aria-hidden="true">
      <defs>
        <ArrowMarker id="afg-mtp" />
        <ArrowMarker id="afg-mtp-acc" tone="accent" />
      </defs>

      <Node x={16} y={44} width={170} height={76} tone="mid" />
      <Label x={101} y={76} anchor="middle" tone="ink" size={10}>
        shared trunk
      </Label>
      <Label x={101} y={92} anchor="middle" tone="mute" size={8}>
        N layers · one forward pass
      </Label>

      <Label x={16} y={146} tone="mute" size={8}>
        input tokens
      </Label>
      {tokens.map((token, index) => (
        <g key={token}>
          <Node
            x={16 + index * 28}
            y={152}
            width={24}
            height={18}
            rx={3}
            tone="mid"
          />
          <Label
            x={28 + index * 28}
            y={165}
            anchor="middle"
            tone="body-mid"
            size={8}
            mono
          >
            {token}
          </Label>
        </g>
      ))}
      {[28, 100, 172].map((x) => (
        <Arrow key={x} d={`M${x} 152 V124`} marker="afg-mtp" width={1} />
      ))}

      <Arrow d="M186 82 H196 V52 H202" marker="afg-mtp-acc" tone="accent" width={1.4} />
      <Arrow d="M186 82 H196 V132 H202" marker="afg-mtp" width={1.4} />

      <Node x={204} y={32} width={96} height={40} tone="accent" />
      <Label x={252} y={49} anchor="middle" tone="accent" size={9}>
        next-token head
      </Label>
      <Label x={252} y={63} anchor="middle" tone="mute" size={8}>
        predicts t+1
      </Label>

      <Node x={204} y={112} width={96} height={40} tone="mid" />
      <Label x={252} y={129} anchor="middle" tone="body-mid" size={9}>
        MTP head
      </Label>
      <Label x={252} y={143} anchor="middle" tone="mute" size={8}>
        predicts t+2
      </Label>

      <Arrow d="M300 52 H306" marker="afg-mtp-acc" tone="accent" width={1} />
      <Arrow d="M300 132 H306" marker="afg-mtp" width={1} />

      <Node x={308} y={40} width={36} height={24} rx={4} tone="accent" />
      <Node x={308} y={120} width={36} height={24} rx={4} tone="mid" />
      <Label x={326} y={55} anchor="middle" tone="accent" size={9} mono>
        t+1
      </Label>
      <Label x={326} y={135} anchor="middle" tone="body-mid" size={9} mono>
        t+2
      </Label>

      <Arrow d="M326 64 V106" marker="afg-mtp" width={1} dashed />
      <Label x={320} y={90} anchor="end" tone="mute" size={7}>
        emb(t+1)
      </Label>

      <Label x={16} y={192} tone="body-mid" size={8}>
        one trunk pass → two next-token targets · head 2 also reads t+1
      </Label>
    </svg>
  );
}

/* ── 7. Dense L×L attention vs top-k sparse selection ──────────────────── */

function SparseAttention(): ReactElement {
  return (
    <svg viewBox="0 0 360 200" className="h-full w-full" aria-hidden="true">
      <Label x={10} y={20} tone="ink" size={10}>
        dense
      </Label>
      <Label x={10} y={32} tone="body-mid" size={8}>
        all L×L pairs → O(L²)
      </Label>
      <Label x={190} y={20} tone="ink" size={10}>
        top-k sparse
      </Label>
      <Label x={190} y={32} tone="accent" size={8}>
        k = 2048 keys per query
      </Label>
      <Label x={356} y={20} anchor="end" tone="accent" size={9} mono>
        O(L·k)
      </Label>

      {Array.from({ length: 10 }, (_, row) =>
        Array.from({ length: 10 }, (_, col) => (
          <rect
            key={`d-${row}-${col}`}
            x={10 + col * 13}
            y={40 + row * 13}
            width={12}
            height={12}
            rx={1}
            strokeWidth={0.75}
            className="fill-body-mid stroke-hairline"
            opacity={0.15}
          />
        )),
      )}

      {Array.from({ length: 10 }, (_, row) =>
        Array.from({ length: 10 }, (_, col) => {
          const selected =
            col === 0 ||
            col === row ||
            col === row - 1 ||
            col === row - 3 ||
            col === row - 6;
          return (
            <rect
              key={`s-${row}-${col}`}
              x={190 + col * 13}
              y={40 + row * 13}
              width={12}
              height={12}
              rx={1}
              strokeWidth={0.75}
              className={
                selected ? "fill-accent stroke-hairline" : "fill-body-mid stroke-hairline"
              }
              opacity={selected ? 0.85 : 0.06}
            />
          );
        }),
      )}

      <Axis x1={327} y1={42} x2={327} y2={167} tone="accent" width={1.2} />
      <Axis x1={322} y1={42} x2={332} y2={42} tone="accent" width={1.2} />
      <Axis x1={322} y1={167} x2={332} y2={167} tone="accent" width={1.2} />
      <text
        x={341}
        y={104}
        textAnchor="middle"
        transform="rotate(-90 341 104)"
        fill="currentColor"
        className="text-accent text-[9px] font-mono"
      >
        2048
      </text>

      <Label x={10} y={186} tone="body-mid" size={8}>
        every query scores every key
      </Label>
      <Label x={190} y={186} tone="accent" size={8}>
        keep 2048 · sink + local + strided
      </Label>
    </svg>
  );
}

/* ── 8. Hybrid thinking: one model, think / non-think modes ────────────── */

function HybridThinking(): ReactElement {
  return (
    <svg viewBox="0 0 360 200" className="h-full w-full" aria-hidden="true">
      <defs>
        <ArrowMarker id="afg-ht" />
        <ArrowMarker id="afg-ht-acc" tone="accent" />
      </defs>

      <Node x={68} y={16} width={64} height={18} rx={9} tone="mid" />
      <circle cx={79} cy={25} r={6.5} className="fill-body-mid" />
      <circle
        cx={121}
        cy={25}
        r={6.5}
        fill="none"
        strokeWidth={1}
        strokeDasharray="2 2"
        className="stroke-hairline"
      />
      <Arrow d="M92 25 H106" marker="afg-ht" width={1} />
      <Label x={138} y={28} tone="mute" size={8}>
        mode switch
      </Label>

      <Arrow d="M100 34 V48" marker="afg-ht" width={1} />
      <Node x={20} y={52} width={160} height={34} tone="mid" />
      <Label x={100} y={70} anchor="middle" tone="ink" size={10}>
        model
      </Label>
      <Label x={100} y={82} anchor="middle" tone="mute" size={8}>
        one set of weights
      </Label>

      <Arrow d="M60 86 V110" marker="afg-ht" width={1.1} />
      <Arrow d="M140 86 V110" marker="afg-ht-acc" tone="accent" width={1.1} />

      <Node x={16} y={112} width={76} height={56} tone="mid" />
      <Label x={54} y={136} anchor="middle" tone="body-mid" size={9}>
        non-think
      </Label>
      <Label x={54} y={150} anchor="middle" tone="mute" size={8}>
        single pass
      </Label>
      <Label x={54} y={162} anchor="middle" tone="mute" size={8}>
        low latency
      </Label>

      <Node x={104} y={112} width={76} height={56} tone="accent" />
      <Label x={142} y={136} anchor="middle" tone="accent" size={9}>
        think
      </Label>
      <Label x={142} y={150} anchor="middle" tone="mute" size={8}>
        drafts + checks
      </Label>
      <Label x={142} y={162} anchor="middle" tone="mute" size={8}>
        more depth
      </Label>

      <Axis x1={210} y1={172} x2={210} y2={40} />
      <Axis x1={210} y1={172} x2={352} y2={172} />
      <Label x={210} y={34} tone="mute" size={8}>
        latency
      </Label>
      <Label x={281} y={190} anchor="middle" tone="mute" size={8}>
        reasoning depth
      </Label>

      <path
        d="M216 172 L216 158 Q280 150 348 56 L348 172 Z"
        className="fill-accent"
        opacity={0.06}
      />
      <Axis x1={216} y1={142} x2={348} y2={142} tone="mid" width={1.5} />
      <Label x={348} y={134} anchor="end" tone="body-mid" size={8}>
        non-think
      </Label>
      <path
        d="M216 158 Q280 150 348 56"
        fill="none"
        strokeWidth={1.5}
        className="stroke-accent"
      />
      <Label x={348} y={48} anchor="end" tone="accent" size={9}>
        think
      </Label>
      <Label x={348} y={166} anchor="end" tone="mute" size={7}>
        extra test-time compute
      </Label>

      <Label x={16} y={186} tone="body-mid" size={8}>
        same weights · two compute paths
      </Label>
    </svg>
  );
}

/* ── 9. Vision tower: patches → encoder → projector → token stream ─────── */

function VisionTower(): ReactElement {
  const highlights = [
    { x: 16, y: 60 },
    { x: 34, y: 96 },
    { x: 70, y: 78 },
  ];
  const tokenXs = [270, 286, 302, 318, 334];
  return (
    <svg viewBox="0 0 360 200" className="h-full w-full" aria-hidden="true">
      <defs>
        <ArrowMarker id="afg-vt" />
        <ArrowMarker id="afg-vt-acc" tone="accent" />
      </defs>

      <Label x={16} y={20} tone="ink" size={10}>
        vision tower
      </Label>
      <Label x={52} y={52} anchor="middle" tone="mute" size={8}>
        patches
      </Label>

      {highlights.map((patch) => (
        <rect
          key={`${patch.x}-${patch.y}`}
          x={patch.x}
          y={patch.y}
          width={18}
          height={18}
          className="fill-accent"
          opacity={0.2}
        />
      ))}
      <Node x={16} y={60} width={72} height={72} rx={2} tone="mid" />
      {[1, 2, 3].map((step) => (
        <g key={step}>
          <Axis x1={16 + step * 18} y1={60} x2={16 + step * 18} y2={132} width={0.75} />
          <Axis x1={16} y1={60 + step * 18} x2={88} y2={60 + step * 18} width={0.75} />
        </g>
      ))}
      <Label x={52} y={148} anchor="middle" tone="body-mid" size={9}>
        image
      </Label>

      <Arrow d="M88 96 H102" marker="afg-vt" width={1.1} />
      <Node x={104} y={64} width={64} height={64} tone="mid" />
      <Label x={136} y={92} anchor="middle" tone="body-mid" size={9}>
        encoder
      </Label>
      <Label x={136} y={106} anchor="middle" tone="mute" size={8}>
        ViT blocks
      </Label>

      <Arrow d="M168 96 H188" marker="afg-vt-acc" tone="accent" width={1.1} />
      <Node x={190} y={64} width={64} height={64} tone="accent" />
      <Label x={222} y={92} anchor="middle" tone="accent" size={9}>
        projector
      </Label>
      <Label x={222} y={106} anchor="middle" tone="mute" size={8}>
        to LLM dim
      </Label>

      <Arrow d="M254 96 H268" marker="afg-vt-acc" tone="accent" width={1.1} />
      {tokenXs.map((x) => (
        <rect
          key={x}
          x={x}
          y={86}
          width={12}
          height={20}
          rx={2}
          strokeWidth={1}
          className="fill-accent stroke-accent"
          opacity={0.18}
        />
      ))}
      <Label x={308} y={80} anchor="middle" tone="mute" size={8}>
        LLM tokens
      </Label>
      <Label x={308} y={124} anchor="middle" tone="accent" size={9}>
        576-token budget
      </Label>
      <Label x={308} y={138} anchor="middle" tone="mute" size={8}>
        per image · input limit
      </Label>

      <Label x={16} y={188} tone="body-mid" size={8}>
        patches → encoder → projector → text stream · dynamic tiling sets patch count
      </Label>
    </svg>
  );
}

/* ── Registry ──────────────────────────────────────────────────────────── */

export const ARCHITECTURE_FIGURES: Partial<
  Record<PaperVisual, () => ReactElement>
> = {
  "moe-routing": MoeRouting,
  "fine-grained-experts": FineGrainedExperts,
  "mla-latent": MlaLatent,
  "fp8-range": Fp8Range,
  "load-balance": LoadBalance,
  "mtp-tokens": MtpTokens,
  "sparse-attention": SparseAttention,
  "hybrid-thinking": HybridThinking,
  "vision-tower": VisionTower,
};
