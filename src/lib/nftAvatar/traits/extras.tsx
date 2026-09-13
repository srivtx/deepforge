import type { Trait } from "../types";

function starPath(cx: number, cy: number, s: number): string {
  const k = s * 0.74;
  const w = s * 0.13;
  return `M ${cx} ${cy - k} Q ${cx + w} ${cy - w} ${cx + k} ${cy} Q ${cx + w} ${cy + w} ${cx} ${cy + k} Q ${cx - w} ${cy + w} ${cx - k} ${cy} Q ${cx - w} ${cy - w} ${cx} ${cy - k} Z`;
}

const RAINBOW_BANDS = ["#ff5a5a", "#ffb347", "#ffe066", "#6ee36e", "#41c7ff", "#b491ff"];

const CONFETTI = [
  { x: 14, y: 14, r: -24, c: "#ff5a5a", s: 3.4 },
  { x: 82, y: 12, r: 32, c: "#ffe066", s: 3 },
  { x: 9, y: 40, r: 12, c: "#41c7ff", s: 2.8 },
  { x: 86, y: 38, r: -18, c: "#6ee36e", s: 3.2 },
  { x: 26, y: 6, r: 48, c: "#b491ff", s: 2.6 },
  { x: 69, y: 7, r: -40, c: "#ffb347", s: 3 },
  { x: 13, y: 62, r: 20, c: "#ffe066", s: 2.6 },
  { x: 84, y: 60, r: -26, c: "#ff5a5a", s: 2.8 },
  { x: 33, y: 9, r: -10, c: "#6ee36e", s: 2.4 },
  { x: 62, y: 11, r: 15, c: "#41c7ff", s: 2.4 },
];

/** Extras: topmost flourish layer. */
export const EXTRA_TRAITS: Trait[] = [
  {
    id: "sparkles",
    name: "Sparkles",
    weight: 14,
    render: (p) => (
      <>
        <path d={starPath(17, 20, 4.4)} fill={p.light} />
        <path d={starPath(78, 16, 5)} fill={p.light} />
        <path d={starPath(12, 58, 3.4)} fill={p.light} />
        <path d={starPath(83, 56, 4)} fill={p.light} />
        <path d={starPath(58, 8, 2.8)} fill={p.light} opacity={0.9} />
        <path d={starPath(36, 7, 2.4)} fill={p.light} opacity={0.85} />
        <path d={starPath(72, 74, 2.7)} fill={p.light} opacity={0.9} />
        <path d={starPath(24, 84, 2.2)} fill={p.light} opacity={0.8} />
        <circle cx={17} cy={20} r={1} fill={p.accent} />
        <circle cx={78} cy={16} r={1.1} fill={p.accent} />
        <circle cx={12} cy={58} r={0.8} fill={p.accent} />
        <circle cx={83} cy={56} r={0.9} fill={p.accent} />
        <circle cx={30} cy={18} r={0.7} fill={p.light} opacity={0.8} />
        <circle cx={66} cy={8} r={0.7} fill={p.light} opacity={0.8} />
        <circle cx={8} cy={30} r={0.7} fill={p.light} opacity={0.7} />
        <circle cx={88} cy={34} r={0.7} fill={p.light} opacity={0.7} />
        <circle cx={52} cy={88} r={0.7} fill={p.light} opacity={0.7} />
      </>
    ),
  },
  {
    id: "embers",
    name: "Rising Embers",
    weight: 6,
    render: (p) => (
      <>
        <path
          d="M 16.5 75 C 15.8 71 16.6 67 18 63 M 24.5 89 C 23.5 85 22.6 81.5 22 78 M 78 82.5 C 79 78.5 79.7 75 80 72 M 84 66.5 C 83.6 63 83.4 59.5 83 56.5 M 66 92.5 C 65 89.5 64.4 86.5 64 84 M 10 52.5 C 10.5 50 10.8 47 11 44.5"
          fill="none"
          stroke={p.accent}
          strokeWidth={2}
          strokeLinecap="round"
          opacity={0.45}
        />
        <circle cx={18} cy={62.4} r={4} fill={p.accent} opacity={0.28} />
        <circle cx={18} cy={62.4} r={1.7} fill={p.light} />
        <circle cx={22} cy={77.6} r={3.4} fill={p.accent} opacity={0.26} />
        <circle cx={22} cy={77.6} r={1.4} fill={p.light} />
        <circle cx={80} cy={71.6} r={3.8} fill={p.accent} opacity={0.28} />
        <circle cx={80} cy={71.6} r={1.6} fill={p.light} />
        <circle cx={83} cy={55.5} r={3.2} fill={p.accent} opacity={0.24} />
        <circle cx={83} cy={55.5} r={1.3} fill={p.light} />
        <circle cx={64} cy={83.4} r={3} fill={p.accent} opacity={0.24} />
        <circle cx={64} cy={83.4} r={1.2} fill={p.light} />
        <circle cx={11} cy={43.4} r={2.8} fill={p.accent} opacity={0.22} />
        <circle cx={11} cy={43.4} r={1.1} fill={p.light} />
        <circle cx={31} cy={92} r={2.4} fill={p.accent} opacity={0.2} />
        <circle cx={31} cy={92} r={1} fill={p.light} opacity={0.9} />
      </>
    ),
  },
  {
    id: "petals",
    name: "Falling Petals",
    weight: 6,
    render: (p) => (
      <>
        <g transform="translate(14 30) rotate(-25)">
          <path
            d="M 0 0 C 2.6 -2.4 6.4 -2.4 7 0 C 6.4 2.4 2.6 2.4 0 0 Z"
            fill={p.light}
            stroke={p.ink}
            strokeWidth={0.7}
            opacity={0.92}
          />
        </g>
        <g transform="translate(27 12) rotate(20)">
          <path
            d="M 0 0 C 2.6 -2.4 6.4 -2.4 7 0 C 6.4 2.4 2.6 2.4 0 0 Z"
            fill={p.accent}
            stroke={p.ink}
            strokeWidth={0.7}
            opacity={0.88}
          />
        </g>
        <g transform="translate(79 24) rotate(150)">
          <path
            d="M 0 0 C 2.6 -2.4 6.4 -2.4 7 0 C 6.4 2.4 2.6 2.4 0 0 Z"
            fill={p.light}
            stroke={p.ink}
            strokeWidth={0.7}
            opacity={0.9}
          />
        </g>
        <g transform="translate(86 46) rotate(-65)">
          <path
            d="M 0 0 C 2.6 -2.4 6.4 -2.4 7 0 C 6.4 2.4 2.6 2.4 0 0 Z"
            fill={p.accent}
            stroke={p.ink}
            strokeWidth={0.7}
            opacity={0.82}
          />
        </g>
        <g transform="translate(70 72) rotate(35)">
          <path
            d="M 0 0 C 2.6 -2.4 6.4 -2.4 7 0 C 6.4 2.4 2.6 2.4 0 0 Z"
            fill={p.light}
            stroke={p.ink}
            strokeWidth={0.7}
            opacity={0.88}
          />
        </g>
        <g transform="translate(36 86) rotate(-145)">
          <path
            d="M 0 0 C 2.6 -2.4 6.4 -2.4 7 0 C 6.4 2.4 2.6 2.4 0 0 Z"
            fill={p.accent}
            stroke={p.ink}
            strokeWidth={0.7}
            opacity={0.8}
          />
        </g>
        <g transform="translate(56 14) rotate(70)">
          <path
            d="M 0 0 C 2.6 -2.4 6.4 -2.4 7 0 C 6.4 2.4 2.6 2.4 0 0 Z"
            fill={p.light}
            stroke={p.ink}
            strokeWidth={0.7}
            opacity={0.8}
          />
        </g>
        <g transform="translate(12 68) rotate(105)">
          <path
            d="M 0 0 C 2.6 -2.4 6.4 -2.4 7 0 C 6.4 2.4 2.6 2.4 0 0 Z"
            fill={p.light}
            stroke={p.ink}
            strokeWidth={0.7}
            opacity={0.85}
          />
        </g>
        <path
          d="M 20 36 C 22 38 24 39 26 39.5 M 83 31 C 81 33 79.5 34.5 77.5 35.5 M 63 78 C 61 79.5 59 80.3 57 80.5"
          fill="none"
          stroke={p.light}
          strokeWidth={1}
          strokeLinecap="round"
          opacity={0.35}
        />
      </>
    ),
  },
  {
    id: "smoke",
    name: "Smoke Wisps",
    weight: 5,
    render: (p) => (
      <>
        <path
          d="M 19 78 C 11 68 20 59 13 49 C 8 41 16 32 13 23"
          fill="none"
          stroke={p.light}
          strokeWidth={4.2}
          strokeLinecap="round"
          opacity={0.26}
        />
        <path
          d="M 77 80 C 85 70 75 61 82 51 C 87 43 79 35 83 26"
          fill="none"
          stroke={p.light}
          strokeWidth={4.2}
          strokeLinecap="round"
          opacity={0.26}
        />
        <path
          d="M 20 77 C 12 67.5 21 58.5 14 48.5 C 9.5 41 17 32 14 23.5"
          fill="none"
          stroke={p.accent}
          strokeWidth={1.6}
          strokeLinecap="round"
          opacity={0.18}
        />
        <path
          d="M 76 79 C 84 69.5 74 60.5 81 50.5 C 86 43 78.5 35 82.5 26.5"
          fill="none"
          stroke={p.accent}
          strokeWidth={1.6}
          strokeLinecap="round"
          opacity={0.18}
        />
        <path
          d="M 30 84 C 26 78 31 73 28 67"
          fill="none"
          stroke={p.light}
          strokeWidth={3}
          strokeLinecap="round"
          opacity={0.2}
        />
        <path
          d="M 66 86 C 70 80 65 74 68.5 68"
          fill="none"
          stroke={p.light}
          strokeWidth={3}
          strokeLinecap="round"
          opacity={0.2}
        />
        <path
          d="M 52 12 C 56 8 50 5 53 1.5"
          fill="none"
          stroke={p.light}
          strokeWidth={2.6}
          strokeLinecap="round"
          opacity={0.18}
        />
      </>
    ),
  },
  {
    id: "aura-ring",
    name: "Aura Ring",
    weight: 3,
    render: (p) => (
      <>
        <circle cx={48} cy={50} r={36} fill="none" stroke={p.accent} strokeWidth={5.5} opacity={0.12} />
        <circle
          cx={48}
          cy={50}
          r={34}
          fill="none"
          stroke={p.light}
          strokeWidth={1.6}
          strokeDasharray="3 7"
          opacity={0.4}
        />
        <circle
          cx={48}
          cy={50}
          r={30.5}
          fill="none"
          stroke={p.accent}
          strokeWidth={1.2}
          strokeDasharray="1.5 7"
          strokeDashoffset={4}
          opacity={0.25}
        />
        <path
          d="M 48 12.5 L 48 9.5 M 83.5 50 L 86.5 50 M 48 87.5 L 48 90.5 M 12.5 50 L 9.5 50"
          fill="none"
          stroke={p.light}
          strokeWidth={1.6}
          strokeLinecap="round"
          opacity={0.6}
        />
        <path d={starPath(19, 24, 2.2)} fill={p.light} opacity={0.85} />
        <path d={starPath(77, 24, 2.2)} fill={p.light} opacity={0.85} />
        <path d={starPath(19, 76, 2)} fill={p.light} opacity={0.7} />
        <path d={starPath(77, 76, 2)} fill={p.light} opacity={0.7} />
      </>
    ),
  },
  {
    id: "lightning",
    name: "Chain Lightning",
    weight: 3,
    render: (p) => (
      <>
        <path
          d="M 76 3 L 66 24 L 72.6 24 L 61 45 L 77.5 19.6 L 70.8 19.6 L 79.5 3 Z"
          fill="none"
          stroke={p.accent}
          strokeWidth={5}
          strokeLinejoin="round"
          opacity={0.3}
        />
        <path
          d="M 76 3 L 66 24 L 72.6 24 L 61 45 L 77.5 19.6 L 70.8 19.6 L 79.5 3 Z"
          fill={p.light}
          stroke={p.ink}
          strokeWidth={1.4}
          strokeLinejoin="round"
        />
        <path
          d="M 20 68 L 14 81 L 18.8 81 L 12.5 92 L 23 78.5 L 18.2 78.5 L 24.5 68 Z"
          fill="none"
          stroke={p.accent}
          strokeWidth={4}
          strokeLinejoin="round"
          opacity={0.25}
        />
        <path
          d="M 20 68 L 14 81 L 18.8 81 L 12.5 92 L 23 78.5 L 18.2 78.5 L 24.5 68 Z"
          fill={p.light}
          stroke={p.ink}
          strokeWidth={1.2}
          strokeLinejoin="round"
        />
        <path
          d="M 84 52 L 80.5 59 L 83.4 59 L 79.5 66 L 86 57.4 L 83.2 57.4 L 86.5 52 Z"
          fill={p.light}
          stroke={p.ink}
          strokeWidth={1.1}
          strokeLinejoin="round"
          opacity={0.9}
        />
        <circle cx={76} cy={4} r={3} fill={p.accent} opacity={0.35} />
        <circle cx={61} cy={45} r={2.2} fill={p.accent} opacity={0.3} />
      </>
    ),
  },
  {
    id: "code-rain",
    name: "Code Rain",
    weight: 2,
    render: (p) => (
      <>
        <rect x={4.5} y={2} width={7} height={36} fill={p.accent} opacity={0.07} />
        <rect x={84.5} y={4} width={7} height={36} fill={p.accent} opacity={0.06} />
        <rect x={65.5} y={6} width={5.5} height={24} fill={p.accent} opacity={0.05} />
        <rect x={22.5} y={2} width={5.5} height={18} fill={p.accent} opacity={0.05} />
        <rect x={6} y={3.5} width={4.6} height={2.2} rx={0.6} fill={p.accent} opacity={0.3} />
        <rect x={6} y={7.7} width={4.6} height={2.2} rx={0.6} fill={p.accent} opacity={0.45} />
        <rect x={6} y={11.9} width={4.6} height={2.2} rx={0.6} fill={p.accent} opacity={0.6} />
        <rect x={6} y={16.1} width={4.6} height={2.2} rx={0.6} fill={p.accent} opacity={0.35} />
        <rect x={6} y={20.3} width={4.6} height={2.2} rx={0.6} fill={p.accent} opacity={0.5} />
        <rect x={6} y={24.5} width={4.6} height={2.2} rx={0.6} fill={p.accent} opacity={0.7} />
        <rect x={6} y={28.7} width={4.6} height={2.2} rx={0.6} fill={p.accent} opacity={0.85} />
        <rect x={6} y={32.9} width={4.6} height={2.2} rx={0.6} fill={p.light} opacity={1} />
        <rect x={86} y={5.5} width={4} height={2} rx={0.6} fill={p.accent} opacity={0.25} />
        <rect x={86} y={9.7} width={4} height={2} rx={0.6} fill={p.accent} opacity={0.4} />
        <rect x={86} y={13.9} width={4} height={2} rx={0.6} fill={p.accent} opacity={0.55} />
        <rect x={86} y={18.1} width={4} height={2} rx={0.6} fill={p.accent} opacity={0.4} />
        <rect x={86} y={22.3} width={4} height={2} rx={0.6} fill={p.accent} opacity={0.6} />
        <rect x={86} y={26.5} width={4} height={2} rx={0.6} fill={p.accent} opacity={0.75} />
        <rect x={86} y={30.7} width={4} height={2} rx={0.6} fill={p.light} opacity={0.95} />
        <rect x={67} y={7.5} width={3.2} height={1.8} rx={0.5} fill={p.accent} opacity={0.3} />
        <rect x={67} y={11.7} width={3.2} height={1.8} rx={0.5} fill={p.accent} opacity={0.5} />
        <rect x={67} y={15.9} width={3.2} height={1.8} rx={0.5} fill={p.accent} opacity={0.65} />
        <rect x={67} y={20.1} width={3.2} height={1.8} rx={0.5} fill={p.light} opacity={0.85} />
        <rect x={24} y={3} width={3.2} height={1.8} rx={0.5} fill={p.accent} opacity={0.25} />
        <rect x={24} y={7.2} width={3.2} height={1.8} rx={0.5} fill={p.accent} opacity={0.4} />
        <rect x={24} y={11.4} width={3.2} height={1.8} rx={0.5} fill={p.accent} opacity={0.55} />
        <rect x={24} y={15.6} width={3.2} height={1.8} rx={0.5} fill={p.light} opacity={0.75} />
        <rect x={33} y={5} width={2.4} height={2.4} rx={0.5} fill={p.accent} opacity={0.5} />
        <rect x={58} y={4} width={2.4} height={2.4} rx={0.5} fill={p.accent} opacity={0.45} />
        <rect x={49} y={6.5} width={2} height={2} rx={0.4} fill={p.light} opacity={0.4} />
      </>
    ),
  },
  {
    id: "drone",
    name: "Camera Drone",
    weight: 2,
    render: (p, uid) => (
      <>
        <defs>
          <linearGradient id={`fx-drone-${uid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={p.light} />
            <stop offset="0.5" stopColor={p.accent} />
            <stop offset="1" stopColor={p.ink} />
          </linearGradient>
        </defs>
        <path
          d="M 86 38 C 82 31 78 26 73.5 22"
          fill="none"
          stroke={p.light}
          strokeWidth={1.4}
          strokeDasharray="1.2 3"
          strokeLinecap="round"
          opacity={0.5}
        />
        <g transform="rotate(-8 72 20)">
          <path
            d="M 70.5 19 L 65 14 M 74.5 19 L 80 14 M 70.5 22.5 L 65 27.5 M 74.5 22.5 L 80 27.5"
            fill="none"
            stroke={p.ink}
            strokeWidth={1.6}
            strokeLinecap="round"
          />
          <ellipse
            cx={64}
            cy={13}
            rx={4.2}
            ry={1.3}
            transform="rotate(-10 64 13)"
            fill={p.light}
            stroke={p.ink}
            strokeWidth={0.9}
            opacity={0.8}
          />
          <ellipse
            cx={81}
            cy={13}
            rx={4.2}
            ry={1.3}
            transform="rotate(10 81 13)"
            fill={p.light}
            stroke={p.ink}
            strokeWidth={0.9}
            opacity={0.8}
          />
          <ellipse
            cx={64}
            cy={28.5}
            rx={3.8}
            ry={1.2}
            transform="rotate(-10 64 28.5)"
            fill={p.light}
            stroke={p.ink}
            strokeWidth={0.9}
            opacity={0.55}
          />
          <ellipse
            cx={81}
            cy={28.5}
            rx={3.8}
            ry={1.2}
            transform="rotate(10 81 28.5)"
            fill={p.light}
            stroke={p.ink}
            strokeWidth={0.9}
            opacity={0.55}
          />
          <rect
            x={66.5}
            y={16.5}
            width={11}
            height={8}
            rx={2.6}
            fill={`url(#fx-drone-${uid})`}
            stroke={p.ink}
            strokeWidth={1.6}
          />
          <path
            d="M 69 20.5 L 75 20.5"
            fill="none"
            stroke={p.ink}
            strokeWidth={0.9}
            opacity={0.35}
          />
          <circle cx={72} cy={22.5} r={1.6} fill={p.ink} />
          <circle cx={72} cy={22.5} r={0.7} fill={p.light} />
          <circle cx={67.5} cy={18} r={2.8} fill={p.accent} opacity={0.35} />
          <circle cx={67.5} cy={18} r={1.1} fill={p.light} />
        </g>
      </>
    ),
  },
  {
    id: "rainbow-arc",
    name: "Rainbow Arc",
    weight: 2,
    render: (p, uid) => (
      <>
        <defs>
          <linearGradient id={`fx-arc-glow-${uid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={p.light} stopOpacity="0.5" />
            <stop offset="1" stopColor={p.accent} stopOpacity="0.1" />
          </linearGradient>
        </defs>
        <path
          d="M16.25 40 A31.75 31.75 0 0 1 79.75 40"
          fill="none"
          stroke={`url(#fx-arc-glow-${uid})`}
          strokeWidth="11"
          strokeLinecap="round"
          opacity="0.5"
        />
        <path
          d="M17.5 40 A30.5 30.5 0 0 1 78.5 40"
          fill="none"
          stroke="#ffffff"
          strokeWidth="4"
          strokeLinecap="round"
          opacity="0.1"
        />
        {RAINBOW_BANDS.map((color, i) => {
          const r = 32 - i * 1.9;
          const dx = Math.sqrt(r * r - 16);
          return (
            <path
              key={`arc-band-${i}`}
              d={`M ${(48 - dx).toFixed(2)} 40 A ${r} ${r} 0 0 1 ${(48 + dx).toFixed(2)} 40`}
              fill="none"
              stroke={color}
              strokeWidth="1.7"
              strokeLinecap="round"
              opacity="0.82"
            />
          );
        })}
        <path d={starPath(48, 8, 2.6)} fill={p.light} />
        <circle cx={16.8} cy={39.2} r={1.1} fill={p.light} opacity="0.9" />
        <circle cx={79.2} cy={39.2} r={1.1} fill={p.light} opacity="0.9" />
      </>
    ),
  },
  {
    id: "third-eye",
    name: "Third Eye",
    weight: 2,
    render: (p, uid) => (
      <>
        <defs>
          <radialGradient id={`fx-eye-aura-${uid}`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={p.accent} stopOpacity="0.55" />
            <stop offset="60%" stopColor={p.accent} stopOpacity="0.18" />
            <stop offset="100%" stopColor={p.accent} stopOpacity="0" />
          </radialGradient>
        </defs>
        <circle cx={48} cy={34} r={9.5} fill={`url(#fx-eye-aura-${uid})`} />
        <path d="M40.2 34 Q48 28 55.8 34 Q48 40 40.2 34 Z" fill={p.ink} stroke={p.ink} strokeWidth="1.7" strokeLinejoin="round" />
        <path d="M41.6 34 Q48 29.2 54.4 34 Q48 38.8 41.6 34 Z" fill={p.light} opacity="0.9" />
        <circle cx={48} cy={34} r={3} fill={p.accent} stroke={p.ink} strokeWidth="0.9" />
        <circle cx={48} cy={34} r={1.25} fill={p.ink} />
        <circle cx={46.9} cy={32.9} r={0.6} fill="#ffffff" />
        <path
          d="M48 27.2 V24.6 M42.3 28.8 L40.8 26.6 M53.7 28.8 L55.2 26.6"
          stroke={p.light}
          strokeWidth="1.2"
          strokeLinecap="round"
          opacity="0.8"
        />
        <path d="M44 40.6 Q48 42.4 52 40.6" fill="none" stroke={p.accent} strokeWidth="1" opacity="0.5" strokeLinecap="round" />
      </>
    ),
  },
  {
    id: "angel-wings",
    name: "Angel Wings",
    weight: 2,
    render: (p, uid) => {
      const wing = (
        <g>
          <path
            d="M71 61.5 C76.5 58 83.2 57.8 86 60.6 C82.4 62.6 77 63.4 72.4 63.6 Z"
            fill={`url(#fx-wing-${uid})`}
            stroke={p.ink}
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          <path
            d="M70.6 65.1 C77.4 63.7 84.2 64.9 86 69 C81.2 70.2 75 69.4 70.8 67.4 Z"
            fill={`url(#fx-wing-${uid})`}
            stroke={p.ink}
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          <path
            d="M70 69.1 C76 69.5 81.3 72.5 82.8 77.4 C77.6 77.3 72.7 74 70 70.7 Z"
            fill={`url(#fx-wing-${uid})`}
            stroke={p.ink}
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          <path
            d="M72.4 62.5 L84.4 59.7 M71.6 66.1 L84.4 66.6 M71.4 70.1 L81.2 75.3"
            fill="none"
            stroke={p.ink}
            strokeWidth="0.8"
            opacity="0.35"
          />
          <ellipse cx={70.8} cy={63.9} rx={2.1} ry={4.1} fill={p.accent} opacity={0.85} stroke={p.ink} strokeWidth="1.2" />
        </g>
      );
      return (
        <>
          <defs>
            <linearGradient id={`fx-wing-${uid}`} x1="0" y1="0" x2="0.4" y2="1">
              <stop offset="0" stopColor="#ffffff" />
              <stop offset="0.55" stopColor={p.light} />
              <stop offset="1" stopColor={p.accent} stopOpacity="0.85" />
            </linearGradient>
          </defs>
          <circle cx={18} cy={67} r={9.5} fill={p.light} opacity="0.15" />
          <circle cx={78} cy={67} r={9.5} fill={p.light} opacity="0.15" />
          {wing}
          <g transform="translate(96 0) scale(-1 1)">{wing}</g>
        </>
      );
    },
  },
  {
    id: "hologram-glitch",
    name: "Hologram Glitch",
    weight: 2,
    render: (p, uid) => (
      <>
        <defs>
          <linearGradient id={`fx-glitch-cy-${uid}`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#41c7ff" stopOpacity="0" />
            <stop offset="0.25" stopColor="#41c7ff" stopOpacity="0.85" />
            <stop offset="0.75" stopColor="#41c7ff" stopOpacity="0.85" />
            <stop offset="1" stopColor="#41c7ff" stopOpacity="0" />
          </linearGradient>
          <linearGradient id={`fx-glitch-mg-${uid}`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#ff5ad0" stopOpacity="0" />
            <stop offset="0.25" stopColor="#ff5ad0" stopOpacity="0.85" />
            <stop offset="0.75" stopColor="#ff5ad0" stopOpacity="0.85" />
            <stop offset="1" stopColor="#ff5ad0" stopOpacity="0" />
          </linearGradient>
        </defs>
        <rect x={13} y={37.4} width={70} height={3.4} fill={`url(#fx-glitch-cy-${uid})`} opacity={0.32} />
        <rect x={10.5} y={38.6} width={72} height={1} fill={`url(#fx-glitch-mg-${uid})`} opacity={0.42} />
        <rect x={16} y={51.6} width={68} height={4.6} fill={`url(#fx-glitch-mg-${uid})`} opacity={0.26} />
        <rect x={12} y={52.8} width={70} height={1.1} fill={`url(#fx-glitch-cy-${uid})`} opacity={0.46} />
        <rect x={18} y={64.6} width={60} height={2.8} fill={`url(#fx-glitch-cy-${uid})`} opacity={0.3} />
        <rect x={22} y={65.6} width={52} height={1} fill={`url(#fx-glitch-mg-${uid})`} opacity={0.42} />
        <rect x={7.5} y={37.4} width={6} height={3.4} fill="#41c7ff" opacity={0.16} />
        <rect x={82.5} y={51.6} width={6} height={4.6} fill="#ff5ad0" opacity={0.16} />
        <rect x={14} y={64.6} width={4.5} height={2.8} fill="#ff5ad0" opacity={0.16} />
        <rect x={79} y={37.8} width={5} height={2.6} fill="#ff5ad0" opacity={0.14} />
      </>
    ),
  },
  {
    id: "confetti-burst",
    name: "Confetti Burst",
    weight: 3,
    render: (p) => (
      <>
        {CONFETTI.map((piece, i) => (
          <rect
            key={`confetti-${i}`}
            x={piece.x}
            y={piece.y}
            width={piece.s}
            height={piece.s * 0.66}
            rx={0.7}
            fill={piece.c}
            opacity={0.95}
            transform={`rotate(${piece.r} ${piece.x + piece.s / 2} ${piece.y + piece.s / 3})`}
          />
        ))}
        <circle cx={20.5} cy={27} r={1.3} fill="#41c7ff" opacity={0.95} />
        <circle cx={75.5} cy={28} r={1.2} fill="#ff5a5a" opacity={0.9} />
        <circle cx={79} cy={50} r={1.1} fill="#ffe066" opacity={0.95} />
        <circle cx={16} cy={50} r={1.2} fill="#b491ff" opacity={0.9} />
        <path d="M56 4.5 L59.5 7.5 L56 10.5 L52.5 7.5 Z" fill="#ffb347" opacity={0.95} />
        <path d="M38 5 L41 7.6 L38 10.2 L35 7.6 Z" fill="#41c7ff" opacity={0.9} />
        <path d={starPath(48, 16, 1.9)} fill={p.light} opacity={0.85} />
        <circle cx={48} cy={24.5} r={0.9} fill={p.light} opacity={0.8} />
      </>
    ),
  },
];
