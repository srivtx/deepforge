import type { Trait } from "../types";

function sparkPath(cx: number, cy: number, s: number): string {
  const w = s * 0.18;
  const k = s * 0.72;
  return `M ${cx} ${cy - s} Q ${cx + w} ${cy - w} ${cx + k} ${cy} Q ${cx + w} ${cy + w} ${cx} ${cy + s} Q ${cx - w} ${cy + w} ${cx - k} ${cy} Q ${cx - w} ${cy - w} ${cx} ${cy - s} Z`;
}

/** Accessories: neck/jaw area, above clothing. */
export const ACCESSORY_TRAITS: Trait[] = [
  {
    id: "gold-chain",
    name: "Gold Chain",
    weight: 11,
    render: (p, uid) => (
      <>
        <defs>
          <linearGradient id={`acc-chain-gem-${uid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={p.light} />
            <stop offset="0.55" stopColor={p.accent} />
            <stop offset="1" stopColor={p.ink} />
          </linearGradient>
        </defs>
        <path
          d="M 28.5 66 Q 48 84 67.5 66"
          fill="none"
          stroke={p.ink}
          strokeWidth={3}
          opacity={0.35}
        />
        <circle cx={29.5} cy={66.8} r={1.6} fill={p.accent} stroke={p.ink} strokeWidth={0.9} />
        <circle cx={31.5} cy={68.4} r={1.6} fill={p.light} stroke={p.ink} strokeWidth={0.9} />
        <circle cx={33.6} cy={69.8} r={1.7} fill={p.accent} stroke={p.ink} strokeWidth={0.9} />
        <circle cx={37.2} cy={72} r={1.7} fill={p.light} stroke={p.ink} strokeWidth={0.9} />
        <circle cx={40.8} cy={73.6} r={1.7} fill={p.accent} stroke={p.ink} strokeWidth={0.9} />
        <circle cx={44.4} cy={74.6} r={1.7} fill={p.light} stroke={p.ink} strokeWidth={0.9} />
        <circle cx={48} cy={75} r={1.8} fill={p.accent} stroke={p.ink} strokeWidth={0.9} />
        <circle cx={51.6} cy={74.6} r={1.7} fill={p.light} stroke={p.ink} strokeWidth={0.9} />
        <circle cx={55.2} cy={73.6} r={1.7} fill={p.accent} stroke={p.ink} strokeWidth={0.9} />
        <circle cx={58.8} cy={72} r={1.7} fill={p.light} stroke={p.ink} strokeWidth={0.9} />
        <circle cx={62.4} cy={69.8} r={1.7} fill={p.accent} stroke={p.ink} strokeWidth={0.9} />
        <circle cx={64.5} cy={68.4} r={1.6} fill={p.light} stroke={p.ink} strokeWidth={0.9} />
        <circle cx={66.5} cy={66.8} r={1.6} fill={p.accent} stroke={p.ink} strokeWidth={0.9} />
        <circle
          cx={48}
          cy={73.2}
          r={1.6}
          fill={p.accent}
          stroke={p.ink}
          strokeWidth={1}
        />
        <path
          d="M 48 74.5 L 53 79 L 48 84.5 L 43 79 Z"
          fill={`url(#acc-chain-gem-${uid})`}
          stroke={p.ink}
          strokeWidth={1.8}
          strokeLinejoin="round"
        />
        <path
          d="M 43 79 L 53 79 M 48 74.5 L 48 84.5"
          fill="none"
          stroke={p.ink}
          strokeWidth={0.9}
          opacity={0.35}
        />
        <circle cx={46.4} cy={77} r={0.9} fill={p.light} opacity={0.9} />
        <circle cx={34} cy={70.4} r={0.6} fill={p.light} />
        <circle cx={58.5} cy={72.6} r={0.6} fill={p.light} />
      </>
    ),
  },
  {
    id: "hoop-earrings",
    name: "Hoop Earrings",
    weight: 13,
    render: (p, uid) => (
      <>
        <defs>
          <linearGradient id={`acc-hoop-${uid}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor={p.light} />
            <stop offset="0.55" stopColor={p.accent} />
            <stop offset="1" stopColor={p.ink} />
          </linearGradient>
        </defs>
        <circle
          cx={25.5}
          cy={53}
          r={4.6}
          fill="none"
          stroke={p.ink}
          strokeWidth={4.6}
        />
        <circle
          cx={25.5}
          cy={53}
          r={4.6}
          fill="none"
          stroke={`url(#acc-hoop-${uid})`}
          strokeWidth={2.4}
        />
        <circle
          cx={70.5}
          cy={53}
          r={4.6}
          fill="none"
          stroke={p.ink}
          strokeWidth={4.6}
        />
        <circle
          cx={70.5}
          cy={53}
          r={4.6}
          fill="none"
          stroke={`url(#acc-hoop-${uid})`}
          strokeWidth={2.4}
        />
        <path
          d="M 22.6 50.4 A 4.6 4.6 0 0 1 26 48.6"
          fill="none"
          stroke={p.light}
          strokeWidth={1.4}
          strokeLinecap="round"
          opacity={0.9}
        />
        <path
          d="M 67.6 50.4 A 4.6 4.6 0 0 1 71 48.6"
          fill="none"
          stroke={p.light}
          strokeWidth={1.4}
          strokeLinecap="round"
          opacity={0.9}
        />
        <circle cx={25.5} cy={47.9} r={1.5} fill={p.light} stroke={p.ink} strokeWidth={1} />
        <circle cx={70.5} cy={47.9} r={1.5} fill={p.light} stroke={p.ink} strokeWidth={1} />
        <circle cx={23.4} cy={54.6} r={0.7} fill={p.light} opacity={0.85} />
        <circle cx={68.4} cy={54.6} r={0.7} fill={p.light} opacity={0.85} />
      </>
    ),
  },
  {
    id: "scarf",
    name: "Knit Scarf",
    weight: 10,
    render: (p, uid) => (
      <>
        <defs>
          <linearGradient id={`acc-scarf-${uid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={p.accent} />
            <stop offset="1" stopColor={p.ink} />
          </linearGradient>
        </defs>
        <path
          d="M 43.5 80 C 40.5 85 38.5 90 37.5 94 C 37.1 95.7 41.5 96.6 44.5 95.8 C 47.5 95 48.5 90.8 49.5 86 C 50.5 81.5 51 78 51 76 Z"
          fill={`url(#acc-scarf-${uid})`}
          stroke={p.ink}
          strokeWidth={2}
          strokeLinejoin="round"
        />
        <path
          d="M 44.5 81 C 42.5 85.5 41 89.5 40.2 93"
          fill="none"
          stroke={p.light}
          strokeWidth={1.6}
          strokeLinecap="round"
          opacity={0.4}
        />
        <path
          d="M 38.3 94.1 L 37.3 96 M 40.8 95.1 L 40.1 96 M 43.4 95.5 L 43 96"
          fill="none"
          stroke={p.ink}
          strokeWidth={1.3}
          strokeLinecap="round"
        />
        <path
          d="M 27 74 C 34 68.5 62 68.5 69 74 C 70.5 78.5 66 83 48 83 C 30 83 25.5 78.5 27 74 Z"
          fill={`url(#acc-scarf-${uid})`}
          stroke={p.ink}
          strokeWidth={2}
          strokeLinejoin="round"
        />
        <path
          d="M 35 70.5 C 34 74 34.5 78 36.5 81 M 48 68.8 C 47.5 73 47.5 78 48 81.6 M 61 70.5 C 62 74 61.5 78 59.5 81"
          fill="none"
          stroke={p.ink}
          strokeWidth={1.3}
          opacity={0.18}
        />
        <path
          d="M 30.5 75 C 37 71.2 59 71.2 65.5 75"
          fill="none"
          stroke={p.ink}
          strokeWidth={2}
          strokeLinecap="round"
          opacity={0.3}
        />
        <path
          d="M 29 73 C 35 68.8 46 68 52 68.3"
          fill="none"
          stroke={p.light}
          strokeWidth={2}
          strokeLinecap="round"
          opacity={0.55}
        />
        <path
          d="M 29.5 80.5 C 36 84 60 84 66.5 80.5"
          fill="none"
          stroke={p.light}
          strokeWidth={1.4}
          strokeLinecap="round"
          opacity={0.4}
        />
        <circle cx={62} cy={73.5} r={2.2} fill={p.light} stroke={p.ink} strokeWidth={1.2} />
        <circle cx={61.4} cy={72.9} r={0.7} fill={p.light} />
      </>
    ),
  },
  {
    id: "monocle",
    name: "Monocle",
    weight: 6,
    render: (p, uid) => (
      <>
        <defs>
          <linearGradient id={`acc-monocle-rim-${uid}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor={p.light} />
            <stop offset="0.5" stopColor={p.accent} />
            <stop offset="1" stopColor={p.ink} />
          </linearGradient>
        </defs>
        <circle cx={56} cy={46} r={6.8} fill={p.light} opacity={0.12} />
        <circle
          cx={56}
          cy={46}
          r={6.8}
          fill="none"
          stroke={p.ink}
          strokeWidth={4}
        />
        <circle
          cx={56}
          cy={46}
          r={6.8}
          fill="none"
          stroke={`url(#acc-monocle-rim-${uid})`}
          strokeWidth={2.2}
        />
        <path
          d="M 51.6 42.2 A 6.8 6.8 0 0 1 57 39.4"
          fill="none"
          stroke={p.light}
          strokeWidth={1.3}
          strokeLinecap="round"
          opacity={0.8}
        />
        <circle cx={53.2} cy={43.2} r={1} fill={p.light} opacity={0.85} />
        <circle cx={60.8} cy={43.4} r={0.9} fill={p.accent} stroke={p.ink} strokeWidth={0.7} />
        <circle cx={60} cy={52} r={1.2} fill={p.accent} stroke={p.ink} strokeWidth={0.7} />
        <circle cx={61.5} cy={55} r={1.2} fill={p.light} stroke={p.ink} strokeWidth={0.7} />
        <circle cx={62.5} cy={58} r={1.2} fill={p.accent} stroke={p.ink} strokeWidth={0.7} />
        <circle cx={63} cy={61} r={1.2} fill={p.light} stroke={p.ink} strokeWidth={0.7} />
        <circle cx={63.2} cy={63.4} r={1.4} fill={p.accent} stroke={p.ink} strokeWidth={0.7} />
      </>
    ),
  },
  {
    id: "face-marks",
    name: "Tribal Marks",
    weight: 6,
    render: (p, uid) => (
      <>
        <path
          d="M 32.5 54.5 L 36.5 51.5 M 33.5 57.5 L 38 54.2 M 34.8 60.3 L 39.3 57"
          fill="none"
          stroke={p.ink}
          strokeWidth={3.6}
          strokeLinecap="round"
        />
        <path
          d="M 32.5 54.5 L 36.5 51.5 M 33.5 57.5 L 38 54.2 M 34.8 60.3 L 39.3 57"
          fill="none"
          stroke={p.light}
          strokeWidth={1.7}
          strokeLinecap="round"
        />
        <path
          d="M 63.5 54.5 L 59.5 51.5 M 62.5 57.5 L 58 54.2 M 61.2 60.3 L 56.7 57"
          fill="none"
          stroke={p.ink}
          strokeWidth={3.6}
          strokeLinecap="round"
        />
        <path
          d="M 63.5 54.5 L 59.5 51.5 M 62.5 57.5 L 58 54.2 M 61.2 60.3 L 56.7 57"
          fill="none"
          stroke={p.light}
          strokeWidth={1.7}
          strokeLinecap="round"
        />
        <path
          d="M 48 31.2 Q 48.5 33.7 51 34.2 Q 48.5 34.7 48 37.2 Q 47.5 34.7 45 34.2 Q 47.5 33.7 48 31.2 Z"
          fill={p.accent}
          stroke={p.ink}
          strokeWidth={0.9}
        />
        <circle cx={30} cy={44} r={1.6} fill={p.accent} stroke={p.ink} strokeWidth={0.9} />
        <circle cx={66} cy={44} r={1.6} fill={p.accent} stroke={p.ink} strokeWidth={0.9} />
        <circle cx={39.5} cy={49} r={1} fill={p.light} opacity={0.9} />
        <circle cx={56.5} cy={49} r={1} fill={p.light} opacity={0.9} />
        <path
          d="M 44 66.5 L 48 69 L 52 66.5"
          fill="none"
          stroke={p.light}
          strokeWidth={1.6}
          strokeLinecap="round"
          opacity={0.85}
        />
      </>
    ),
  },
  {
    id: "breathing-mask",
    name: "Breathing Mask",
    weight: 5,
    render: (p, uid) => (
      <>
        <defs>
          <linearGradient id={`acc-mask-body-${uid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={p.light} />
            <stop offset="0.42" stopColor={p.accent} />
            <stop offset="1" stopColor={p.ink} />
          </linearGradient>
        </defs>
        <path
          d="M 35.5 57.5 L 27 52.5 M 60.5 57.5 L 69 52.5"
          fill="none"
          stroke={p.ink}
          strokeWidth={3.2}
          strokeLinecap="round"
        />
        <path
          d="M 35.5 57.5 L 27 52.5 M 60.5 57.5 L 69 52.5"
          fill="none"
          stroke={p.light}
          strokeWidth={1.5}
          strokeLinecap="round"
          opacity={0.55}
        />
        <path
          d="M 36 55 C 36 54 60 54 60 55 C 62.5 60 61.5 67 57.5 70.5 C 54 73.5 42 73.5 38.5 70.5 C 34.5 67 33.5 60 36 55 Z"
          fill={`url(#acc-mask-body-${uid})`}
          stroke={p.ink}
          strokeWidth={2}
          strokeLinejoin="round"
        />
        <path
          d="M 37.5 56.5 C 44 54.8 52 54.8 58.5 56.5"
          fill="none"
          stroke={p.light}
          strokeWidth={1.5}
          strokeLinecap="round"
          opacity={0.7}
        />
        <path
          d="M 40 69.5 C 41 66 42 62 42.5 58.5 M 50 69.7 C 49.7 66 49.3 62 49.2 58.5"
          fill="none"
          stroke={p.ink}
          strokeWidth={1.2}
          opacity={0.25}
        />
        <circle cx={48} cy={63.5} r={4.5} fill={p.ink} stroke={p.ink} strokeWidth={2} />
        <circle
          cx={48}
          cy={63.5}
          r={2.8}
          fill="none"
          stroke={p.light}
          strokeWidth={1}
          opacity={0.6}
        />
        <circle cx={48} cy={63.5} r={1} fill={p.accent} />
        <path
          d="M 43.5 59 L 43.5 61.5 M 52.5 59 L 52.5 61.5 M 43.5 65.5 L 43.5 68 M 52.5 65.5 L 52.5 68"
          fill="none"
          stroke={p.light}
          strokeWidth={1.1}
          strokeLinecap="round"
          opacity={0.5}
        />
        <path
          d="M 45 70.5 C 47 71.3 49 71.3 51 70.5"
          fill="none"
          stroke={p.ink}
          strokeWidth={1}
          opacity={0.4}
        />
      </>
    ),
  },
  {
    id: "eyepatch",
    name: "Eyepatch",
    weight: 3,
    render: (p, uid) => (
      <>
        <path
          d="M 23 46.5 L 73 41.5"
          fill="none"
          stroke={p.light}
          strokeWidth={4.6}
          strokeLinecap="round"
        />
        <path
          d="M 23 46.5 L 73 41.5"
          fill="none"
          stroke={p.ink}
          strokeWidth={2.8}
          strokeLinecap="round"
        />
        <ellipse
          cx={40}
          cy={46}
          rx={7.2}
          ry={6.4}
          transform="rotate(-10 40 46)"
          fill={p.ink}
          stroke={p.accent}
          strokeWidth={1.6}
          strokeDasharray="2.4 2.4"
        />
        <ellipse
          cx={37.5}
          cy={43.2}
          rx={2.6}
          ry={1.6}
          transform="rotate(-25 37.5 43.2)"
          fill={p.light}
          opacity={0.18}
        />
        <path
          d="M 36.5 43.5 L 43.5 48.5 M 43.5 43.5 L 36.5 48.5"
          fill="none"
          stroke={p.light}
          strokeWidth={1.4}
          strokeLinecap="round"
          opacity={0.8}
        />
      </>
    ),
  },
  {
    id: "led-collar",
    name: "LED Collar",
    weight: 3,
    render: (p, uid) => (
      <>
        <defs>
          <linearGradient id={`acc-collar-band-${uid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={p.accent} />
            <stop offset="0.35" stopColor={p.ink} />
            <stop offset="1" stopColor={p.ink} />
          </linearGradient>
        </defs>
        <path
          d="M 29 69 C 34 64.5 62 64.5 67 69 C 68.5 74.5 63 78.5 48 78.5 C 33 78.5 27.5 74.5 29 69 Z"
          fill={`url(#acc-collar-band-${uid})`}
          stroke={p.ink}
          strokeWidth={2}
          strokeLinejoin="round"
        />
        <path
          d="M 30 68.6 C 35 64.8 61 64.8 66 68.6"
          fill="none"
          stroke={p.accent}
          strokeWidth={1.6}
          strokeLinecap="round"
          opacity={0.8}
        />
        <path
          d="M 32 67.6 C 36 65 44 64.2 48 64.4"
          fill="none"
          stroke={p.light}
          strokeWidth={1.4}
          strokeLinecap="round"
          opacity={0.5}
        />
        <rect
          x={63.4}
          y={67.4}
          width={4.6}
          height={5.4}
          rx={1.2}
          fill={p.ink}
          stroke={p.light}
          strokeWidth={0.9}
        />
        <path
          d="M 64.6 68.6 L 66.8 69.8 M 64.6 71.4 L 66.8 70.2"
          fill="none"
          stroke={p.light}
          strokeWidth={0.7}
          opacity={0.7}
        />
        <circle cx={36} cy={72.4} r={3.2} fill={p.accent} opacity={0.25} />
        <circle cx={36} cy={72.4} r={1.4} fill={p.light} />
        <circle cx={41} cy={74.2} r={3.2} fill={p.accent} opacity={0.25} />
        <circle cx={41} cy={74.2} r={1.4} fill={p.light} />
        <circle cx={46} cy={75} r={3.4} fill={p.accent} opacity={0.3} />
        <circle cx={46} cy={75} r={1.5} fill={p.light} />
        <circle cx={51} cy={75} r={3.4} fill={p.accent} opacity={0.3} />
        <circle cx={51} cy={75} r={1.5} fill={p.light} />
        <circle cx={56} cy={74.2} r={3.2} fill={p.accent} opacity={0.25} />
        <circle cx={56} cy={74.2} r={1.4} fill={p.light} />
        <circle cx={61} cy={72.4} r={3.2} fill={p.accent} opacity={0.25} />
        <circle cx={61} cy={72.4} r={1.4} fill={p.light} />
      </>
    ),
  },
  {
    id: "gem-studs",
    name: "Gem Studs",
    weight: 5,
    render: (p, uid) => (
      <>
        <defs>
          <linearGradient id={`acc-gem-${uid}`} x1="0" y1="0" x2="0.6" y2="1">
            <stop offset="0" stopColor={p.light} />
            <stop offset="0.55" stopColor={p.accent} />
            <stop offset="1" stopColor={p.ink} />
          </linearGradient>
        </defs>
        <path
          d="M 35 35.6 L 37.2 38.2 L 35 40.8 L 32.8 38.2 Z"
          fill={`url(#acc-gem-${uid})`}
          stroke={p.ink}
          strokeWidth={1.1}
          strokeLinejoin="round"
        />
        <path
          d="M 39.5 33.9 L 41.7 36.5 L 39.5 39.1 L 37.3 36.5 Z"
          fill={`url(#acc-gem-${uid})`}
          stroke={p.ink}
          strokeWidth={1.1}
          strokeLinejoin="round"
        />
        <path
          d="M 44 33.6 L 46.2 36.2 L 44 38.8 L 41.8 36.2 Z"
          fill={`url(#acc-gem-${uid})`}
          stroke={p.ink}
          strokeWidth={1.1}
          strokeLinejoin="round"
        />
        <path
          d="M 52 33.6 L 54.2 36.2 L 52 38.8 L 49.8 36.2 Z"
          fill={`url(#acc-gem-${uid})`}
          stroke={p.ink}
          strokeWidth={1.1}
          strokeLinejoin="round"
        />
        <path
          d="M 56.5 33.9 L 58.7 36.5 L 56.5 39.1 L 54.3 36.5 Z"
          fill={`url(#acc-gem-${uid})`}
          stroke={p.ink}
          strokeWidth={1.1}
          strokeLinejoin="round"
        />
        <path
          d="M 61 35.6 L 63.2 38.2 L 61 40.8 L 58.8 38.2 Z"
          fill={`url(#acc-gem-${uid})`}
          stroke={p.ink}
          strokeWidth={1.1}
          strokeLinejoin="round"
        />
        <path
          d="M 25.5 45.6 Q 26.2 49.2 29.9 50 Q 26.2 50.8 25.5 54.4 Q 24.8 50.8 21.1 50 Q 24.8 49.2 25.5 45.6 Z"
          fill={p.light}
          stroke={p.ink}
          strokeWidth={0.9}
        />
        <path
          d="M 70.5 45.6 Q 71.2 49.2 74.9 50 Q 71.2 50.8 70.5 54.4 Q 69.8 50.8 66.1 50 Q 69.8 49.2 70.5 45.6 Z"
          fill={p.light}
          stroke={p.ink}
          strokeWidth={0.9}
        />
        <circle cx={34.2} cy={37.4} r={0.6} fill={p.light} opacity={0.95} />
        <circle cx={38.7} cy={35.7} r={0.6} fill={p.light} opacity={0.95} />
        <circle cx={43.2} cy={35.4} r={0.6} fill={p.light} opacity={0.95} />
        <circle cx={51.2} cy={35.4} r={0.6} fill={p.light} opacity={0.95} />
        <circle cx={55.7} cy={35.7} r={0.6} fill={p.light} opacity={0.95} />
        <circle cx={60.2} cy={37.4} r={0.6} fill={p.light} opacity={0.95} />
        <circle cx={28.5} cy={44.5} r={1.4} fill={p.accent} stroke={p.ink} strokeWidth={0.8} />
        <circle cx={67.5} cy={44.5} r={1.4} fill={p.accent} stroke={p.ink} strokeWidth={0.8} />
      </>
    ),
  },
  {
    id: "bow-tie",
    name: "Bow Tie",
    weight: 6,
    render: (p, uid) => (
      <>
        <defs>
          <linearGradient id={`acc-bow-${uid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={p.light} />
            <stop offset="0.45" stopColor={p.accent} />
            <stop offset="1" stopColor={p.ink} />
          </linearGradient>
        </defs>
        <path
          d="M 47 72.5 C 42 69.5 36.5 68.5 33.5 69.5 C 31.5 70.2 31.5 74.8 33.5 75.5 C 36.5 76.5 42 75.5 47 72.5 Z"
          fill={`url(#acc-bow-${uid})`}
          stroke={p.ink}
          strokeWidth={1.8}
          strokeLinejoin="round"
        />
        <path
          d="M 49 72.5 C 54 69.5 59.5 68.5 62.5 69.5 C 64.5 70.2 64.5 74.8 62.5 75.5 C 59.5 76.5 54 75.5 49 72.5 Z"
          fill={`url(#acc-bow-${uid})`}
          stroke={p.ink}
          strokeWidth={1.8}
          strokeLinejoin="round"
        />
        <path
          d="M 34.5 70 C 37 69.5 40.5 70.5 43.5 72.2 M 38 75.2 C 40.5 74.4 43.2 73.4 45.5 72.2"
          fill="none"
          stroke={p.light}
          strokeWidth={1.2}
          strokeLinecap="round"
          opacity={0.5}
        />
        <path
          d="M 61.5 70 C 59 69.5 55.5 70.5 52.5 72.2 M 58 75.2 C 55.5 74.4 52.8 73.4 50.5 72.2"
          fill="none"
          stroke={p.light}
          strokeWidth={1.2}
          strokeLinecap="round"
          opacity={0.5}
        />
        <rect
          x={44.8}
          y={70}
          width={6.4}
          height={5.2}
          rx={1.6}
          fill={`url(#acc-bow-${uid})`}
          stroke={p.ink}
          strokeWidth={1.8}
        />
        <path
          d="M 45.8 70.8 L 45.8 74.4 M 50.2 70.8 L 50.2 74.4"
          fill="none"
          stroke={p.ink}
          strokeWidth={0.8}
          opacity={0.4}
        />
        <circle cx={46.4} cy={71.4} r={0.8} fill={p.light} opacity={0.85} />
      </>
    ),
  },
  {
    id: "iced-chain",
    name: "Iced Chain",
    weight: 2,
    render: (p, uid) => (
      <>
        <defs>
          <linearGradient id={`acc-iced-link-${uid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#ffffff" />
            <stop offset="0.45" stopColor="#c9f0ff" />
            <stop offset="1" stopColor="#7cc4e8" />
          </linearGradient>
          <linearGradient id={`acc-iced-gem-${uid}`} x1="0" y1="0" x2="0.5" y2="1">
            <stop offset="0" stopColor="#ffffff" />
            <stop offset="0.5" stopColor="#bdeeff" />
            <stop offset="1" stopColor="#4a9fca" />
          </linearGradient>
        </defs>
        <path d="M27 66.5 Q48 86.5 69 66.5" fill="none" stroke={p.ink} strokeWidth="5.8" opacity="0.3" />
        {Array.from({ length: 11 }, (_, i) => {
          const t = (i + 0.5) / 11;
          const x = 27 + 42 * t;
          const y = 66.5 + 40 * t * (1 - t);
          return (
            <g key={`link-${i}`}>
              <path
                d={`M${x.toFixed(2)} ${(y - 2.7).toFixed(2)} L${(x + 2.7).toFixed(2)} ${y.toFixed(2)} L${x.toFixed(2)} ${(y + 2.7).toFixed(2)} L${(x - 2.7).toFixed(2)} ${y.toFixed(2)} Z`}
                fill={`url(#acc-iced-link-${uid})`}
                stroke={p.ink}
                strokeWidth={1.1}
                strokeLinejoin="round"
              />
              <path
                d={`M${x.toFixed(2)} ${(y - 1.5).toFixed(2)} L${(x + 1.5).toFixed(2)} ${y.toFixed(2)} L${x.toFixed(2)} ${(y + 1.5).toFixed(2)} L${(x - 1.5).toFixed(2)} ${y.toFixed(2)} Z`}
                fill="none"
                stroke="#ffffff"
                strokeWidth={0.7}
                opacity={0.9}
              />
            </g>
          );
        })}
        <path
          d="M48 74.5 L53.5 80.5 L48 87 L42.5 80.5 Z"
          fill={`url(#acc-iced-gem-${uid})`}
          stroke={p.ink}
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
        <path d="M42.5 80.5 H53.5 M48 74.5 V87 M45.2 77.5 L50.8 83.5 M50.8 77.5 L45.2 83.5" fill="none" stroke={p.ink} strokeWidth="0.7" opacity="0.4" />
        <path d="M45.8 76.6 L47.6 78.2" stroke="#ffffff" strokeWidth="1" opacity="0.95" strokeLinecap="round" />
        <path d={sparkPath(44.2, 78.6, 2.2)} fill="#ffffff" />
        <path d={sparkPath(54.4, 83.4, 1.8)} fill="#ffffff" opacity="0.9" />
        <path d={sparkPath(33.2, 70.4, 1.6)} fill={p.light} opacity="0.9" />
        <path d={sparkPath(62.8, 70.2, 1.5)} fill="#ffffff" opacity="0.85" />
        <circle cx={51.2} cy={76.2} r={0.7} fill="#ffffff" opacity="0.9" />
        <circle cx={39.4} cy={73.8} r={0.7} fill={p.light} opacity="0.85" />
        <circle cx={57.6} cy={74.8} r={0.6} fill={p.light} opacity="0.85" />
      </>
    ),
  },
  {
    id: "pixel-shades",
    name: "Pixel Shades",
    weight: 3,
    render: (p, uid) => (
      <>
        <defs>
          <linearGradient id={`acc-shades-${uid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#2a2a36" />
            <stop offset="0.5" stopColor="#0c0c14" />
            <stop offset="1" stopColor="#020207" />
          </linearGradient>
        </defs>
        <path d="M30 43.5 H23.2 M66 43.5 H72.8" stroke={p.ink} strokeWidth="2.4" strokeLinecap="square" />
        <path d="M30.5 42.5 H45.5 V51.5 H30.5 Z" fill={`url(#acc-shades-${uid})`} stroke={p.ink} strokeWidth="1.4" strokeLinejoin="round" />
        <path d="M50.5 42.5 H65.5 V51.5 H50.5 Z" fill={`url(#acc-shades-${uid})`} stroke={p.ink} strokeWidth="1.4" strokeLinejoin="round" />
        <rect x={45.5} y={44.6} width={5} height={2.4} fill={p.ink} />
        <path d="M30.5 43 H45.5 M50.5 43 H65.5" stroke="#5a5a6e" strokeWidth="0.7" opacity="0.55" />
        <path d="M32.5 50 H43.5 M52.5 50 H63.5" stroke={p.light} strokeWidth="0.7" opacity="0.25" />
        <rect x={33} y={44.8} width={2.2} height={2.2} fill="#ffffff" opacity="0.92" />
        <rect x={53} y={44.8} width={1.4} height={1.4} fill="#ffffff" opacity="0.5" />
        <path d="M30.5 42.5 L30.5 43.5 M45.5 42.5 L45.5 43.5 M50.5 42.5 L50.5 43.5 M65.5 42.5 L65.5 43.5" stroke={p.ink} strokeWidth="0.8" opacity="0.6" />
      </>
    ),
  },
  {
    id: "gas-mask",
    name: "Gas Mask",
    weight: 2,
    render: (p, uid) => (
      <>
        <defs>
          <linearGradient id={`acc-gas-body-${uid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={p.bg[1]} />
            <stop offset="0.45" stopColor={p.ink} />
            <stop offset="1" stopColor="#05060a" />
          </linearGradient>
          <linearGradient id={`acc-gas-filter-${uid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={p.accent} />
            <stop offset="0.5" stopColor={p.ink} />
            <stop offset="1" stopColor="#05060a" />
          </linearGradient>
        </defs>
        <path
          d="M34 56 L24.5 50.5 M62 56 L71.5 50.5"
          fill="none"
          stroke={p.ink}
          strokeWidth="3.4"
          strokeLinecap="round"
        />
        <path
          d="M34 56 L24.5 50.5 M62 56 L71.5 50.5"
          fill="none"
          stroke={p.light}
          strokeWidth="1.3"
          strokeLinecap="round"
          opacity="0.4"
        />
        <g transform="rotate(-18 27 63.5)">
          <rect x={20.5} y={58} width={11.5} height={11} rx={2.8} fill={`url(#acc-gas-filter-${uid})`} stroke={p.ink} strokeWidth="1.8" />
          <rect x={22.6} y={60.2} width={7.3} height={6.6} rx={1.7} fill={p.ink} opacity="0.7" />
          <path d="M22.6 61.4 H29.9 M22.6 63.5 H29.9 M22.6 65.6 H29.9" stroke={p.light} strokeWidth="0.6" opacity="0.4" />
          <circle cx={26.2} cy={61.8} r={0.8} fill={p.light} opacity="0.55" />
        </g>
        <g transform="rotate(18 69 63.5)">
          <rect x={64} y={58} width={11.5} height={11} rx={2.8} fill={`url(#acc-gas-filter-${uid})`} stroke={p.ink} strokeWidth="1.8" />
          <rect x={66.1} y={60.2} width={7.3} height={6.6} rx={1.7} fill={p.ink} opacity="0.7" />
          <path d="M66.1 61.4 H73.4 M66.1 63.5 H73.4 M66.1 65.6 H73.4" stroke={p.light} strokeWidth="0.6" opacity="0.4" />
          <circle cx={69.7} cy={61.8} r={0.8} fill={p.light} opacity="0.55" />
        </g>
        <path
          d="M33 55.5 C33.5 53.5 62.5 53.5 63 55.5 C66.5 61 65 70 58.5 74 C53.5 77 42.5 77 37.5 74 C31 70 29.5 61 33 55.5 Z"
          fill={`url(#acc-gas-body-${uid})`}
          stroke={p.ink}
          strokeWidth="2.2"
          strokeLinejoin="round"
        />
        <path d="M34.5 56 C41 54.4 55 54.4 61.5 56" fill="none" stroke={p.light} strokeWidth="1.4" opacity="0.5" strokeLinecap="round" />
        <circle cx={48} cy={66} r={4.6} fill="#10131c" stroke="#1d2130" strokeWidth="2" />
        <circle cx={48} cy={66} r={3.4} fill="none" stroke={p.light} strokeWidth="0.9" opacity="0.5" />
        <path d="M48 62.8 V69.2 M44.8 66 H51.2" stroke={p.light} strokeWidth="0.8" opacity="0.5" />
        <path
          d="M41.5 60.2 Q44.2 62.6 42.6 65.4 M54.5 60.2 Q51.8 62.6 53.4 65.4"
          fill="none"
          stroke={p.ink}
          strokeWidth="1.2"
          opacity="0.45"
        />
        <path d="M39 71.6 L42.4 70.4 M57 71.6 L53.6 70.4" fill="none" stroke={p.light} strokeWidth="1" opacity="0.4" strokeLinecap="round" />
        <circle cx={35.5} cy={58.5} r={0.9} fill={p.light} opacity="0.5" />
        <circle cx={60.5} cy={58.5} r={0.9} fill={p.light} opacity="0.5" />
        <circle cx={33.5} cy={70} r={0.8} fill={p.light} opacity="0.35" />
        <circle cx={62.5} cy={70} r={0.8} fill={p.light} opacity="0.35" />
      </>
    ),
  },
];
