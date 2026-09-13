import type { Trait } from "../types";

function starPath(cx: number, cy: number, s: number): string {
  const k = s * 0.74;
  const w = s * 0.13;
  return `M ${cx} ${cy - k} Q ${cx + w} ${cy - w} ${cx + k} ${cy} Q ${cx + w} ${cy + w} ${cx} ${cy + k} Q ${cx - w} ${cy + w} ${cx - k} ${cy} Q ${cx - w} ${cy - w} ${cx} ${cy - k} Z`;
}

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
];
