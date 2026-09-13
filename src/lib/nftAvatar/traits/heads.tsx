import type { AvatarPalette, Trait } from "../types";

const CIRCLE_26 = "M22 50 A26 26 0 1 1 74 50 A26 26 0 1 1 22 50 Z";
const CIRCLE_265 = "M21.5 50 A26.5 26.5 0 1 1 74.5 50 A26.5 26.5 0 1 1 21.5 50 Z";
const FROG_ELLIPSE = "M20 52.5 A28 22.5 0 1 1 76 52.5 A28 22.5 0 1 1 20 52.5 Z";

/** Per-head gradient, clip and rim-light definitions. */
function HeadDefs({
  p,
  uid,
  id,
  d,
}: {
  p: AvatarPalette;
  uid: string;
  id: string;
  d: string;
}) {
  return (
    <defs>
      <radialGradient id={`hd-${id}-base-${uid}`} cx="36%" cy="26%" r="84%">
        <stop offset="0%" stopColor={p.light} stopOpacity="0.44" />
        <stop offset="32%" stopColor={p.accent} stopOpacity="0.3" />
        <stop offset="70%" stopColor={p.bg[1]} />
        <stop offset="100%" stopColor={p.ink} />
      </radialGradient>
      <linearGradient id={`hd-${id}-shade-${uid}`} x1="0" y1="0.32" x2="0" y2="1">
        <stop offset="0%" stopColor={p.ink} stopOpacity="0" />
        <stop offset="100%" stopColor={p.ink} stopOpacity="0.6" />
      </linearGradient>
      <linearGradient id={`hd-${id}-rim-${uid}`} x1="0.05" y1="0" x2="0.72" y2="1">
        <stop offset="0%" stopColor={p.light} stopOpacity="0.4" />
        <stop offset="42%" stopColor={p.light} stopOpacity="0" />
      </linearGradient>
      <clipPath id={`hd-${id}-clip-${uid}`}>
        <path d={d} />
      </clipPath>
    </defs>
  );
}

function grad(id: string, uid: string, kind: "base" | "shade" | "rim"): string {
  return `url(#hd-${id}-${kind}-${uid})`;
}

function clip(id: string, uid: string): string {
  return `url(#hd-${id}-clip-${uid})`;
}

/** Shared neck shape tucked behind every head. */
function Neck({ p }: { p: AvatarPalette }) {
  return (
    <>
      <path
        d="M39.5 66 L39.5 84 Q48 88.5 56.5 84 L56.5 66 Z"
        fill={p.bg[1]}
        stroke={p.ink}
        strokeWidth="2.4"
        strokeLinejoin="round"
      />
      <path d="M39.5 66 L39.5 84 Q43 86 46 86.6 L46 66 Z" fill={p.ink} opacity="0.45" />
    </>
  );
}

/** Glossy top-left highlight: soft ellipse + hot dot. */
function Gloss({
  p,
  cx,
  cy,
  rx,
  ry,
  rot = -22,
  opacity = 0.3,
}: {
  p: AvatarPalette;
  cx: number;
  cy: number;
  rx: number;
  ry: number;
  rot?: number;
  opacity?: number;
}) {
  return (
    <>
      <ellipse
        cx={cx}
        cy={cy}
        rx={rx}
        ry={ry}
        fill={p.light}
        opacity={opacity}
        transform={`rotate(${rot} ${cx} ${cy})`}
      />
      <circle cx={cx - 2.1} cy={cy + 1.6} r={1.3} fill={p.light} opacity={opacity + 0.16} />
    </>
  );
}

/** Heads: centered circle at (48, 50), radius ~26. */
export const HEAD_TRAITS: Trait[] = [
  {
    id: "cat",
    name: "Alley Cat",
    weight: 13,
    render: (p, uid) => {
      const id = "cat";
      return (
        <>
          <HeadDefs p={p} uid={uid} id={id} d={CIRCLE_26} />
          <Neck p={p} />
          <path
            d="M28.5 31 L21.5 13.5 L43 23.5 Z"
            fill={grad(id, uid, "base")}
            stroke={p.ink}
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
          <path d="M27.6 27.6 L23.8 17 L36.4 23.2 Z" fill={p.accent} opacity="0.42" />
          <path
            d="M67.5 31 L74.5 13.5 L53 23.5 Z"
            fill={grad(id, uid, "base")}
            stroke={p.ink}
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
          <path d="M68.4 27.6 L72.2 17 L59.6 23.2 Z" fill={p.accent} opacity="0.42" />
          <circle cx="48" cy="50" r="26" fill={grad(id, uid, "base")} stroke={p.ink} strokeWidth="2.5" />
          <circle cx="48" cy="50" r="26" fill={grad(id, uid, "shade")} />
          <circle cx="48" cy="50" r="26" fill={grad(id, uid, "rim")} />
          <g clipPath={clip(id, uid)}>
            <ellipse cx="48" cy="66" rx="21" ry="12" fill={p.ink} opacity="0.26" />
            <ellipse cx="48" cy="57.5" rx="10.5" ry="8" fill={p.light} opacity="0.15" />
            <path
              d="M41.5 30.5 L45.5 34 L49.5 30.5"
              fill="none"
              stroke={p.ink}
              strokeWidth="1.8"
              strokeOpacity="0.38"
              strokeLinecap="round"
            />
            <path
              d="M46.5 30.5 L50.5 34 L54.5 30.5"
              fill="none"
              stroke={p.ink}
              strokeWidth="1.8"
              strokeOpacity="0.38"
              strokeLinecap="round"
            />
            <path d="M22 45.5 L28.5 47.5" stroke={p.ink} strokeWidth="2" strokeOpacity="0.25" strokeLinecap="round" />
            <path d="M22 51 L29 52.5" stroke={p.ink} strokeWidth="2" strokeOpacity="0.25" strokeLinecap="round" />
            <path d="M74 45.5 L67.5 47.5" stroke={p.ink} strokeWidth="2" strokeOpacity="0.25" strokeLinecap="round" />
            <path d="M74 51 L67 52.5" stroke={p.ink} strokeWidth="2" strokeOpacity="0.25" strokeLinecap="round" />
          </g>
          {[
            [32, 54.5],
            [31, 57],
            [32, 59.5],
            [64, 54.5],
            [65, 57],
            [64, 59.5],
          ].map(([x, y]) => (
            <circle key={`whisker-${x}-${y}`} cx={x} cy={y} r="0.9" fill={p.ink} opacity="0.5" />
          ))}
          <path
            d="M45.4 54 L50.6 54 L48 57.4 Z"
            fill={p.accent}
            stroke={p.ink}
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
          <Gloss p={p} cx={37} cy={33.5} rx={6.4} ry={2.9} />
        </>
      );
    },
  },
  {
    id: "human",
    name: "Founder",
    weight: 13,
    render: (p, uid) => {
      const id = "human";
      return (
        <>
          <HeadDefs p={p} uid={uid} id={id} d={CIRCLE_26} />
          <Neck p={p} />
          <ellipse
            cx="21.6"
            cy="50"
            rx="3.6"
            ry="6.4"
            fill={grad(id, uid, "base")}
            stroke={p.ink}
            strokeWidth="2.4"
          />
          <path d="M21.2 46.6 Q23.8 50 21.2 53.4" fill="none" stroke={p.ink} strokeWidth="1.4" opacity="0.45" />
          <ellipse
            cx="74.4"
            cy="50"
            rx="3.6"
            ry="6.4"
            fill={grad(id, uid, "base")}
            stroke={p.ink}
            strokeWidth="2.4"
          />
          <path d="M74.8 46.6 Q72.2 50 74.8 53.4" fill="none" stroke={p.ink} strokeWidth="1.4" opacity="0.45" />
          <circle cx="48" cy="50" r="26" fill={grad(id, uid, "base")} stroke={p.ink} strokeWidth="2.5" />
          <circle cx="48" cy="50" r="26" fill={grad(id, uid, "shade")} />
          <circle cx="48" cy="50" r="26" fill={grad(id, uid, "rim")} />
          <g clipPath={clip(id, uid)}>
            <ellipse cx="48" cy="67" rx="20" ry="11" fill={p.ink} opacity="0.26" />
            <path
              d="M29 33.5 Q38.5 26 48 26 Q57.5 26 67 33.5 Q59.5 30.4 48 30.4 Q36.5 30.4 29 33.5 Z"
              fill={p.ink}
              opacity="0.4"
            />
            <path d="M33.5 41.5 Q40 39.4 46 41" fill="none" stroke={p.ink} strokeWidth="2.6" strokeOpacity="0.12" strokeLinecap="round" />
            <path d="M62.5 41.5 Q56 39.4 50 41" fill="none" stroke={p.ink} strokeWidth="2.6" strokeOpacity="0.12" strokeLinecap="round" />
            <path d="M46.6 52.6 Q48.4 55.8 46.2 56.9" fill="none" stroke={p.ink} strokeWidth="1.5" strokeOpacity="0.4" strokeLinecap="round" />
            <ellipse cx="35.5" cy="56.5" rx="6" ry="3.6" fill={p.light} opacity="0.09" />
            <ellipse cx="60.5" cy="56.5" rx="6" ry="3.6" fill={p.light} opacity="0.09" />
          </g>
          <Gloss p={p} cx={36.5} cy={34} rx={6.5} ry={2.8} rot={-24} />
        </>
      );
    },
  },
  {
    id: "ape",
    name: "Stone Ape",
    weight: 12,
    render: (p, uid) => {
      const id = "ape";
      return (
        <>
          <HeadDefs p={p} uid={uid} id={id} d={CIRCLE_265} />
          <Neck p={p} />
          <circle cx="22.6" cy="51" r="7" fill={grad(id, uid, "base")} stroke={p.ink} strokeWidth="2.4" />
          <circle cx="24.2" cy="51" r="3.5" fill={p.ink} opacity="0.35" />
          <circle cx="73.4" cy="51" r="7" fill={grad(id, uid, "base")} stroke={p.ink} strokeWidth="2.4" />
          <circle cx="71.8" cy="51" r="3.5" fill={p.ink} opacity="0.35" />
          <circle cx="48" cy="50" r="26.5" fill={grad(id, uid, "base")} stroke={p.ink} strokeWidth="2.5" />
          <circle cx="48" cy="50" r="26.5" fill={grad(id, uid, "shade")} />
          <circle cx="48" cy="50" r="26.5" fill={grad(id, uid, "rim")} />
          <g clipPath={clip(id, uid)}>
            <ellipse cx="48" cy="68" rx="22" ry="12" fill={p.ink} opacity="0.28" />
            <path d="M28 42 Q48 35.6 68 42 Q48 39.2 28 42 Z" fill={p.ink} opacity="0.55" />
            <path d="M30 40.2 Q48 34.4 66 40.2" fill="none" stroke={p.light} strokeWidth="1.3" opacity="0.16" />
            <ellipse cx="48" cy="59" rx="13.5" ry="10.5" fill={p.bg[1]} stroke={p.ink} strokeWidth="2" />
            <path d="M38.5 56.5 Q48 52.4 57.5 56.5" fill="none" stroke={p.light} strokeWidth="1.5" opacity="0.18" />
            <ellipse
              cx="44"
              cy="55.7"
              rx="1.7"
              ry="1.15"
              fill={p.ink}
              opacity="0.9"
              transform="rotate(-18 44 55.7)"
            />
            <ellipse
              cx="52"
              cy="55.7"
              rx="1.7"
              ry="1.15"
              fill={p.ink}
              opacity="0.9"
              transform="rotate(18 52 55.7)"
            />
            <path d="M25.5 58 Q28.5 61 26.5 64.5" fill="none" stroke={p.ink} strokeWidth="1.6" strokeOpacity="0.3" strokeLinecap="round" />
            <path d="M70.5 58 Q67.5 61 69.5 64.5" fill="none" stroke={p.ink} strokeWidth="1.6" strokeOpacity="0.3" strokeLinecap="round" />
          </g>
          <Gloss p={p} cx={36.5} cy={32.5} rx={7} ry={3} rot={-20} />
        </>
      );
    },
  },
  {
    id: "bear",
    name: "Honey Bear",
    weight: 12,
    render: (p, uid) => {
      const id = "bear";
      return (
        <>
          <HeadDefs p={p} uid={uid} id={id} d={CIRCLE_265} />
          <Neck p={p} />
          <circle cx="28.5" cy="28.8" r="8" fill={grad(id, uid, "base")} stroke={p.ink} strokeWidth="2.4" />
          <circle cx="28.8" cy="29.2" r="4.2" fill={p.ink} opacity="0.3" />
          <circle cx="67.5" cy="28.8" r="8" fill={grad(id, uid, "base")} stroke={p.ink} strokeWidth="2.4" />
          <circle cx="67.2" cy="29.2" r="4.2" fill={p.ink} opacity="0.3" />
          <circle cx="48" cy="50" r="26.5" fill={grad(id, uid, "base")} stroke={p.ink} strokeWidth="2.5" />
          <circle cx="48" cy="50" r="26.5" fill={grad(id, uid, "shade")} />
          <circle cx="48" cy="50" r="26.5" fill={grad(id, uid, "rim")} />
          <g clipPath={clip(id, uid)}>
            <ellipse cx="48" cy="68" rx="22" ry="12" fill={p.ink} opacity="0.26" />
            <path d="M35 29.5 Q40 27.5 45 28.5" fill="none" stroke={p.light} strokeWidth="1.6" strokeOpacity="0.12" strokeLinecap="round" />
            <path d="M51 28.5 Q56 27.5 61 29.5" fill="none" stroke={p.light} strokeWidth="1.6" strokeOpacity="0.12" strokeLinecap="round" />
            <ellipse cx="48" cy="58.5" rx="12" ry="9.5" fill={p.light} opacity="0.17" stroke={p.ink} strokeWidth="1.8" />
            <ellipse cx="48" cy="54.6" rx="4.4" ry="3.1" fill={p.ink} />
            <ellipse cx="46.5" cy="53.5" rx="1.4" ry="0.8" fill={p.light} opacity="0.5" />
            <path d="M33 60 Q30.5 58 31 55.5" fill="none" stroke={p.ink} strokeWidth="1.5" strokeOpacity="0.22" strokeLinecap="round" />
            <path d="M63 60 Q65.5 58 65 55.5" fill="none" stroke={p.ink} strokeWidth="1.5" strokeOpacity="0.22" strokeLinecap="round" />
          </g>
          <Gloss p={p} cx={37} cy={33.5} rx={6.6} ry={3} rot={-20} />
        </>
      );
    },
  },
  {
    id: "fox",
    name: "Red Fox",
    weight: 11,
    render: (p, uid) => {
      const id = "fox";
      return (
        <>
          <HeadDefs p={p} uid={uid} id={id} d={CIRCLE_26} />
          <Neck p={p} />
          <path
            d="M29 31 L22.5 13 L44 23 Z"
            fill={grad(id, uid, "base")}
            stroke={p.ink}
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
          <path d="M28.4 27.6 L24.6 17 L37.4 23.4 Z" fill={p.ink} opacity="0.5" />
          <path
            d="M67 31 L73.5 13 L52 23 Z"
            fill={grad(id, uid, "base")}
            stroke={p.ink}
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
          <path d="M67.6 27.6 L71.4 17 L58.6 23.4 Z" fill={p.ink} opacity="0.5" />
          <circle cx="48" cy="50" r="26" fill={grad(id, uid, "base")} stroke={p.ink} strokeWidth="2.5" />
          <circle cx="48" cy="50" r="26" fill={grad(id, uid, "shade")} />
          <circle cx="48" cy="50" r="26" fill={grad(id, uid, "rim")} />
          <g clipPath={clip(id, uid)}>
            <ellipse cx="48" cy="67" rx="20" ry="11" fill={p.ink} opacity="0.22" />
            <path
              d="M35.5 52.5 Q48 47.8 60.5 52.5 Q59 65 48 70 Q37 65 35.5 52.5 Z"
              fill={p.light}
              opacity="0.16"
            />
            <path d="M34 53 L29 55.5 L34.2 57.5 Z" fill={p.light} opacity="0.24" />
            <path d="M34.2 59 L29.5 61.5 L34.6 63 Z" fill={p.light} opacity="0.2" />
            <path d="M62 53 L67 55.5 L61.8 57.5 Z" fill={p.light} opacity="0.24" />
            <path d="M61.8 59 L66.5 61.5 L61.4 63 Z" fill={p.light} opacity="0.2" />
            <path
              d="M44.6 31.5 Q48 28.8 51.4 31.5"
              fill="none"
              stroke={p.accent}
              strokeWidth="2"
              strokeOpacity="0.5"
              strokeLinecap="round"
            />
            <path d="M31 47.5 Q34 45.5 37 46.5" fill="none" stroke={p.ink} strokeWidth="1.5" strokeOpacity="0.2" strokeLinecap="round" />
            <path d="M65 47.5 Q62 45.5 59 46.5" fill="none" stroke={p.ink} strokeWidth="1.5" strokeOpacity="0.2" strokeLinecap="round" />
          </g>
          <path d="M45.2 53.4 L50.8 53.4 L48 56.9 Z" fill={p.ink} strokeLinejoin="round" />
          <circle cx="47" cy="54.4" r="0.7" fill={p.light} opacity="0.6" />
          <Gloss p={p} cx={38} cy={32} rx={6.4} ry={2.8} rot={-24} />
        </>
      );
    },
  },
  {
    id: "panda",
    name: "Bamboo Panda",
    weight: 6,
    render: (p, uid) => {
      const id = "panda";
      return (
        <>
          <HeadDefs p={p} uid={uid} id={id} d={CIRCLE_26} />
          <Neck p={p} />
          <circle cx="28" cy="27.6" r="7.6" fill={p.ink} stroke={p.ink} strokeWidth="2.2" />
          <path d="M23.5 24.6 Q28 20.6 33 23.2" fill="none" stroke={p.light} strokeWidth="1.4" opacity="0.16" strokeLinecap="round" />
          <circle cx="68" cy="27.6" r="7.6" fill={p.ink} stroke={p.ink} strokeWidth="2.2" />
          <path d="M72.5 24.6 Q68 20.6 63 23.2" fill="none" stroke={p.light} strokeWidth="1.4" opacity="0.16" strokeLinecap="round" />
          <circle cx="48" cy="50" r="26" fill={grad(id, uid, "base")} stroke={p.ink} strokeWidth="2.5" />
          <circle cx="48" cy="50" r="26" fill={p.light} opacity="0.24" />
          <circle cx="48" cy="50" r="26" fill={grad(id, uid, "shade")} />
          <circle cx="48" cy="50" r="26" fill={grad(id, uid, "rim")} />
          <g clipPath={clip(id, uid)}>
            <ellipse cx="48" cy="68" rx="21" ry="11.5" fill={p.ink} opacity="0.2" />
            <ellipse cx="40" cy="47" rx="8.2" ry="9.6" fill={p.ink} opacity="0.9" transform="rotate(-10 40 47)" />
            <ellipse cx="56" cy="47" rx="8.2" ry="9.6" fill={p.ink} opacity="0.9" transform="rotate(10 56 47)" />
            <path d="M34.5 40.5 Q38 38.4 42 39.4" fill="none" stroke={p.light} strokeWidth="1.3" strokeOpacity="0.22" strokeLinecap="round" />
            <path d="M61.5 40.5 Q58 38.4 54 39.4" fill="none" stroke={p.light} strokeWidth="1.3" strokeOpacity="0.22" strokeLinecap="round" />
            <ellipse cx="48" cy="58.4" rx="10" ry="7.4" fill={p.light} opacity="0.14" />
            <ellipse cx="48" cy="54.8" rx="3.9" ry="2.9" fill={p.ink} />
            <ellipse cx="46.6" cy="53.8" rx="1.3" ry="0.75" fill={p.light} opacity="0.5" />
          </g>
          <Gloss p={p} cx={36.5} cy={32.5} rx={6.4} ry={2.8} />
        </>
      );
    },
  },
  {
    id: "frog",
    name: "Pond Frog",
    weight: 6,
    render: (p, uid) => {
      const id = "frog";
      return (
        <>
          <HeadDefs p={p} uid={uid} id={id} d={FROG_ELLIPSE} />
          <Neck p={p} />
          <ellipse cx="48" cy="52.5" rx="28" ry="22.5" fill={grad(id, uid, "base")} stroke={p.ink} strokeWidth="2.5" />
          <ellipse cx="48" cy="52.5" rx="28" ry="22.5" fill={grad(id, uid, "shade")} />
          <ellipse cx="48" cy="52.5" rx="28" ry="22.5" fill={grad(id, uid, "rim")} />
          <circle cx="40" cy="44.5" r="8.2" fill={grad(id, uid, "base")} stroke={p.ink} strokeWidth="2.4" />
          <circle cx="56" cy="44.5" r="8.2" fill={grad(id, uid, "base")} stroke={p.ink} strokeWidth="2.4" />
          <g clipPath={clip(id, uid)}>
            <ellipse cx="48" cy="70" rx="24" ry="10" fill={p.ink} opacity="0.28" />
            <path
              d="M32 61 Q48 53.5 64 61 Q62 74 48 76.5 Q34 74 32 61 Z"
              fill={p.light}
              opacity="0.17"
            />
            {[
              [35, 35.5, 1.8, 0.14],
              [62.5, 34.5, 2.2, 0.16],
              [42.5, 30.5, 1.3, 0.12],
              [54.5, 29.5, 1.2, 0.12],
              [48.5, 32.5, 1.1, 0.1],
            ].map(([x, y, r, o]) => (
              <circle key={`spot-${x}-${y}`} cx={x} cy={y} r={r} fill={p.ink} opacity={o} />
            ))}
            <circle cx="44.4" cy="51.6" r="1.25" fill={p.ink} opacity="0.65" />
            <circle cx="51.6" cy="51.6" r="1.25" fill={p.ink} opacity="0.65" />
          </g>
          <ellipse cx="37" cy="41.3" rx="2.8" ry="1.6" fill={p.light} opacity="0.3" transform="rotate(-18 37 41.3)" />
          <ellipse cx="53" cy="41.3" rx="2.8" ry="1.6" fill={p.light} opacity="0.3" transform="rotate(-18 53 41.3)" />
        </>
      );
    },
  },
  {
    id: "alien",
    name: "Visitor",
    weight: 5,
    render: (p, uid) => {
      const id = "alien";
      const d =
        "M48 21 C63.5 21 72.5 32.5 72.5 47.5 C72.5 64 61.5 78.5 48 78.5 C34.5 78.5 23.5 64 23.5 47.5 C23.5 32.5 32.5 21 48 21 Z";
      return (
        <>
          <HeadDefs p={p} uid={uid} id={id} d={d} />
          <Neck p={p} />
          <path d="M37.5 24 Q33 15 38 8.6" fill="none" stroke={p.ink} strokeWidth="2.4" strokeLinecap="round" />
          <circle cx="38.2" cy="7.4" r="5.4" fill={p.accent} opacity="0.22" />
          <circle cx="38.2" cy="7.4" r="2.7" fill={p.accent} stroke={p.ink} strokeWidth="1.8" />
          <path d="M58.5 24 Q63 15 58 8.6" fill="none" stroke={p.ink} strokeWidth="2.4" strokeLinecap="round" />
          <circle cx="57.8" cy="7.4" r="5.4" fill={p.accent} opacity="0.22" />
          <circle cx="57.8" cy="7.4" r="2.7" fill={p.accent} stroke={p.ink} strokeWidth="1.8" />
          <path d={d} fill={grad(id, uid, "base")} stroke={p.ink} strokeWidth="2.5" strokeLinejoin="round" />
          <path d={d} fill={grad(id, uid, "shade")} />
          <path d={d} fill={grad(id, uid, "rim")} />
          <g clipPath={clip(id, uid)}>
            <ellipse cx="48" cy="70" rx="19" ry="12" fill={p.ink} opacity="0.24" />
            <circle cx="48" cy="32" r="4.5" fill={p.accent} opacity="0.2" />
            <path
              d="M48 28.5 L50.4 32 L48 35.5 L45.6 32 Z"
              fill={p.accent}
              stroke={p.ink}
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
            {[
              [33, 44.5],
              [30.5, 50.5],
              [33.5, 56.5],
              [63, 44.5],
              [65.5, 50.5],
              [62.5, 56.5],
            ].map(([x, y]) => (
              <circle key={`spot-${x}-${y}`} cx={x} cy={y} r="1.2" fill={p.accent} opacity="0.55" />
            ))}
            <ellipse cx="48" cy="68" rx="8" ry="5" fill={p.light} opacity="0.1" />
          </g>
          <Gloss p={p} cx={38} cy={31} rx={6} ry={3} />
        </>
      );
    },
  },
  {
    id: "robot",
    name: "Unit-96",
    weight: 3,
    render: (p, uid) => {
      const id = "robot";
      const d =
        "M36.5 27 H59.5 A12 12 0 0 1 71.5 39 V60 A12 12 0 0 1 59.5 72 H36.5 A12 12 0 0 1 24.5 60 V39 A12 12 0 0 1 36.5 27 Z";
      return (
        <>
          <HeadDefs p={p} uid={uid} id={id} d={d} />
          <rect x="40" y="68" width="16" height="16" rx="4" fill={p.bg[1]} stroke={p.ink} strokeWidth="2.4" />
          <path d="M40 74 H56 M40 79 H56" stroke={p.ink} strokeWidth="1.2" opacity="0.4" />
          <path d="M48 27 V14.5" stroke={p.ink} strokeWidth="2.6" strokeLinecap="round" />
          <circle cx="48" cy="12" r="6" fill={p.accent} opacity="0.2" />
          <circle cx="48" cy="12" r="3.2" fill={p.accent} stroke={p.ink} strokeWidth="2" />
          <rect x="20" y="43.5" width="5" height="14" rx="2.2" fill={p.ink} opacity="0.9" />
          <circle cx="22.5" cy="50.5" r="3.5" fill={p.accent} opacity="0.3" />
          <circle cx="22.5" cy="50.5" r="1.5" fill={p.accent} />
          <rect x="71" y="43.5" width="5" height="14" rx="2.2" fill={p.ink} opacity="0.9" />
          <circle cx="73.5" cy="50.5" r="3.5" fill={p.accent} opacity="0.3" />
          <circle cx="73.5" cy="50.5" r="1.5" fill={p.accent} />
          <rect x="24.5" y="27" width="47" height="45" rx="12" fill={grad(id, uid, "base")} stroke={p.ink} strokeWidth="2.5" />
          <rect x="24.5" y="27" width="47" height="45" rx="12" fill={grad(id, uid, "shade")} />
          <rect x="24.5" y="27" width="47" height="45" rx="12" fill={grad(id, uid, "rim")} />
          <g clipPath={clip(id, uid)}>
            <ellipse cx="48" cy="70" rx="24" ry="10" fill={p.ink} opacity="0.26" />
            <rect x="29.5" y="35.5" width="37" height="19" rx="9" fill={p.light} opacity="0.06" stroke={p.ink} strokeWidth="1.4" strokeOpacity="0.4" />
            <path d="M30 31 Q48 27.5 66 31" fill="none" stroke={p.light} strokeWidth="1.6" opacity="0.2" />
            <path d="M31 59.5 H65" stroke={p.ink} strokeWidth="1.4" opacity="0.35" />
            <circle cx="31.5" cy="31.7" r="1.5" fill={p.ink} opacity="0.5" />
            <circle cx="64.5" cy="31.7" r="1.5" fill={p.ink} opacity="0.5" />
            <circle cx="31" cy="31.2" r="0.5" fill={p.light} opacity="0.5" />
            <circle cx="64" cy="31.2" r="0.5" fill={p.light} opacity="0.5" />
            <path d="M34 68 H41 M34 70.5 H41 M55 68 H62 M55 70.5 H62" stroke={p.ink} strokeWidth="1.4" strokeOpacity="0.35" strokeLinecap="round" />
          </g>
          <Gloss p={p} cx={37.5} cy={32.5} rx={6.5} ry={2.6} rot={-14} />
        </>
      );
    },
  },
  {
    id: "skull",
    name: "Remains",
    weight: 2,
    render: (p, uid) => {
      const id = "skull";
      return (
        <>
          <HeadDefs p={p} uid={uid} id={id} d={CIRCLE_265} />
          <Neck p={p} />
          <circle cx="48" cy="50" r="26.5" fill={grad(id, uid, "base")} stroke={p.ink} strokeWidth="2.5" />
          <circle cx="48" cy="50" r="26.5" fill={p.light} opacity="0.46" />
          <circle cx="48" cy="50" r="26.5" fill={grad(id, uid, "shade")} />
          <circle cx="48" cy="50" r="26.5" fill={grad(id, uid, "rim")} />
          <g clipPath={clip(id, uid)}>
            <ellipse cx="48" cy="70" rx="20" ry="11" fill={p.ink} opacity="0.3" />
            <ellipse cx="40" cy="46.5" rx="8" ry="9.4" fill={p.ink} opacity="0.92" transform="rotate(-8 40 46.5)" />
            <ellipse cx="56" cy="46.5" rx="8" ry="9.4" fill={p.ink} opacity="0.92" transform="rotate(8 56 46.5)" />
            <path d="M33.5 42 Q37 38.6 42 39.8" fill="none" stroke={p.light} strokeWidth="1.4" strokeOpacity="0.25" strokeLinecap="round" />
            <path d="M62.5 42 Q59 38.6 54 39.8" fill="none" stroke={p.light} strokeWidth="1.4" strokeOpacity="0.25" strokeLinecap="round" />
            <path d="M48 56.5 L45.4 52.2 Q48 50.4 50.6 52.2 Z" fill={p.ink} opacity="0.92" strokeLinejoin="round" />
            <path d="M31 51 Q34 56 31.5 61" fill="none" stroke={p.ink} strokeWidth="1.5" strokeOpacity="0.3" strokeLinecap="round" />
            <path d="M65 51 Q62 56 64.5 61" fill="none" stroke={p.ink} strokeWidth="1.5" strokeOpacity="0.3" strokeLinecap="round" />
            <path d="M39 63 Q48 66 57 63" fill="none" stroke={p.ink} strokeWidth="1.4" strokeOpacity="0.3" strokeLinecap="round" />
            <path d="M61 29.5 L58 33.5 L60.5 36.5 L58.5 39" fill="none" stroke={p.ink} strokeWidth="1.3" strokeOpacity="0.35" strokeLinecap="round" strokeLinejoin="round" />
          </g>
          <Gloss p={p} cx={36.5} cy={32} rx={6.5} ry={2.8} rot={-24} opacity={0.34} />
        </>
      );
    },
  },
  {
    id: "monkey",
    name: "Cheeky Monkey",
    weight: 8,
    render: (p, uid) => {
      const id = "monkey";
      return (
        <>
          <defs>
            <radialGradient id={`hd-${id}-base-${uid}`} cx="35%" cy="24%" r="88%">
              <stop offset="0%" stopColor="#e6bb8c" />
              <stop offset="34%" stopColor="#bb8659" />
              <stop offset="74%" stopColor="#8a5c39" />
              <stop offset="100%" stopColor="#5d3a20" />
            </radialGradient>
            <linearGradient id={`hd-${id}-shade-${uid}`} x1="0" y1="0.32" x2="0" y2="1">
              <stop offset="0%" stopColor={p.ink} stopOpacity="0" />
              <stop offset="100%" stopColor={p.ink} stopOpacity="0.58" />
            </linearGradient>
            <linearGradient id={`hd-${id}-rim-${uid}`} x1="0.05" y1="0" x2="0.72" y2="1">
              <stop offset="0%" stopColor={p.light} stopOpacity="0.42" />
              <stop offset="42%" stopColor={p.light} stopOpacity="0" />
            </linearGradient>
            <clipPath id={`hd-${id}-clip-${uid}`}>
              <path d={CIRCLE_26} />
            </clipPath>
          </defs>
          <Neck p={p} />
          <circle cx={21.8} cy={40.4} r={9.2} fill={`url(#hd-${id}-base-${uid})`} stroke={p.ink} strokeWidth="2.4" />
          <ellipse cx={22.3} cy={40.6} rx={4.7} ry={5.7} fill="#d9a97c" stroke={p.ink} strokeWidth="1.5" />
          <path
            d="M18.7 37.4 Q22 34.8 25.6 37.2"
            fill="none"
            stroke="#f2d8b4"
            strokeWidth="1.3"
            opacity="0.6"
            strokeLinecap="round"
          />
          <circle cx={74.2} cy={40.4} r={9.2} fill={`url(#hd-${id}-base-${uid})`} stroke={p.ink} strokeWidth="2.4" />
          <ellipse cx={73.7} cy={40.6} rx={4.7} ry={5.7} fill="#d9a97c" stroke={p.ink} strokeWidth="1.5" />
          <path
            d="M77.3 37.4 Q74 34.8 70.4 37.2"
            fill="none"
            stroke="#f2d8b4"
            strokeWidth="1.3"
            opacity="0.6"
            strokeLinecap="round"
          />
          <circle cx={48} cy={50} r={26} fill={`url(#hd-${id}-base-${uid})`} stroke={p.ink} strokeWidth="2.5" />
          <circle cx={48} cy={50} r={26} fill={`url(#hd-${id}-shade-${uid})`} />
          <circle cx={48} cy={50} r={26} fill={`url(#hd-${id}-rim-${uid})`} />
          <g clipPath={`url(#hd-${id}-clip-${uid})`}>
            <ellipse cx={48} cy={69} rx={22} ry={11} fill={p.ink} opacity={0.24} />
            <path
              d="M48 27.5 C39.5 27.5 32.5 32.6 31.6 40.2 C30.9 45.4 33.6 50.8 37.2 54 C35.2 60.2 39.6 68.2 48 69.6 C56.4 68.2 60.8 60.2 58.8 54 C62.4 50.8 65.1 45.4 64.4 40.2 C63.5 32.6 56.5 27.5 48 27.5 Z"
              fill="#e8c9a0"
              stroke={p.ink}
              strokeWidth="1.8"
              strokeLinejoin="round"
            />
            <path
              d="M48 29.5 C40.8 29.5 35 33.6 33.8 40"
              fill="none"
              stroke="#f8e6ca"
              strokeWidth="1.6"
              opacity="0.65"
              strokeLinecap="round"
            />
            <ellipse cx={48} cy={60.4} rx={11.8} ry={8.6} fill="#f4ddb6" stroke={p.ink} strokeWidth="1.6" />
            <ellipse cx={48} cy={61} rx={9.2} ry={5.6} fill="#fdeed2" opacity="0.6" />
            <ellipse
              cx={44.5}
              cy={57.8}
              rx={1.25}
              ry={0.8}
              fill={p.ink}
              opacity={0.85}
              transform="rotate(-14 44.5 57.8)"
            />
            <ellipse
              cx={51.5}
              cy={57.8}
              rx={1.25}
              ry={0.8}
              fill={p.ink}
              opacity={0.85}
              transform="rotate(14 51.5 57.8)"
            />
            <path
              d="M48 59.2 Q49.5 61.4 47.7 62.6"
              fill="none"
              stroke={p.ink}
              strokeWidth="1.3"
              opacity={0.5}
              strokeLinecap="round"
            />
            <path
              d="M32 44 Q35 46.2 36.6 44.6 M64 44 Q61 46.2 59.4 44.6"
              fill="none"
              stroke={p.ink}
              strokeWidth="1.3"
              opacity={0.28}
              strokeLinecap="round"
            />
            <circle cx={36} cy={51.5} r={1} fill={p.ink} opacity={0.24} />
            <circle cx={60} cy={51.5} r={1} fill={p.ink} opacity={0.24} />
            <path
              d="M35.5 40.6 Q41 38.4 45.8 39.4 M60.5 40.6 Q55 38.4 50.2 39.4"
              fill="none"
              stroke={p.ink}
              strokeWidth="2.4"
              strokeOpacity="0.15"
              strokeLinecap="round"
            />
          </g>
          <path
            d="M43.8 25.6 C42.2 20.4 43.4 15.6 46.4 12.2 C46.2 16.4 46.9 19.4 48.1 21.6 C48.7 17 50.6 14.6 53.6 12.8 C52.7 17 52.1 20.2 52.4 23.4 C54 21.8 55.8 21.2 57.8 21.6 C55.6 23.8 53.6 25.8 52.6 28.2 Z"
            fill="#8a5c39"
            stroke={p.ink}
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
          <path
            d="M44.9 23.6 C44 19.6 44.9 16.6 46.6 14.4"
            fill="none"
            stroke="#d9a97c"
            strokeWidth="1.2"
            opacity="0.7"
            strokeLinecap="round"
          />
          <path
            d="M50.4 22.6 C50.8 18.6 52.2 16.2 54 14.8"
            fill="none"
            stroke="#d9a97c"
            strokeWidth="1"
            opacity="0.6"
            strokeLinecap="round"
          />
          <Gloss p={p} cx={36.5} cy={33} rx={6.6} ry={3} rot={-22} />
        </>
      );
    },
  },
];
