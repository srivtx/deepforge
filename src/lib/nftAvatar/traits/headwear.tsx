import type { Trait } from "../types";

/** Headwear: sits above the head, edge around y = 30-38. */
export const HEADWEAR_TRAITS: Trait[] = [
  {
    id: "headband",
    name: "Signal Headband",
    weight: 14,
    render: (p, uid) => (
      <>
        <defs>
          <linearGradient id={`hw-band-${uid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={p.light} />
            <stop offset="0.5" stopColor={p.accent} />
            <stop offset="1" stopColor={p.ink} />
          </linearGradient>
        </defs>
        <path
          d="M 23 47 Q 28 34 48 34 Q 68 34 73 47 L 73 52 Q 68 40 48 40 Q 28 40 23 52 Z"
          fill={`url(#hw-band-${uid})`}
          stroke={p.ink}
          strokeWidth={2}
          strokeLinejoin="round"
        />
        <path
          d="M 23.3 49.5 Q 28.3 37 48 37 Q 67.7 37 72.7 49.5"
          fill="none"
          stroke={p.light}
          strokeWidth={2.1}
          strokeLinecap="round"
          opacity={0.8}
        />
        <path
          d="M 23.1 48 Q 28.1 35.5 48 35.5 Q 67.9 35.5 72.9 48"
          fill="none"
          stroke={p.light}
          strokeWidth={1.2}
          strokeLinecap="round"
          opacity={0.45}
        />
        <path
          d="M 49.6 33.4 L 45.6 38.4 L 47.9 38.4 L 46.4 42 L 50.4 37 L 48.1 37 Z"
          fill={p.accent}
          stroke={p.ink}
          strokeWidth={1}
          strokeLinejoin="round"
        />
        <path
          d="M 26.5 48.5 C 26.8 44 27.7 40.5 29 37.5"
          fill="none"
          stroke={p.ink}
          strokeWidth={1}
          opacity={0.3}
        />
        <path
          d="M 69.5 48.5 C 69.2 44 68.3 40.5 67 37.5"
          fill="none"
          stroke={p.ink}
          strokeWidth={1}
          opacity={0.3}
        />
      </>
    ),
  },
  {
    id: "beanie",
    name: "Knit Beanie",
    weight: 12,
    render: (p, uid) => (
      <>
        <defs>
          <linearGradient id={`hw-beanie-${uid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={p.light} />
            <stop offset="0.45" stopColor={p.accent} />
            <stop offset="1" stopColor={p.ink} />
          </linearGradient>
          <radialGradient id={`hw-pom-${uid}`} cx="0.35" cy="0.3" r="0.85">
            <stop offset="0" stopColor={p.light} />
            <stop offset="0.6" stopColor={p.accent} />
            <stop offset="1" stopColor={p.ink} />
          </radialGradient>
        </defs>
        <path
          d="M 23 45 C 24 31.5 33 20 48 20 C 63 20 72 31.5 73 45 Z"
          fill={`url(#hw-beanie-${uid})`}
          stroke={p.ink}
          strokeWidth={2}
          strokeLinejoin="round"
        />
        <path
          d="M 30 41 L 40.5 26.5 M 35.5 44 L 46 25.5 M 41 45.3 L 51.5 24.8 M 46.5 45.6 L 57 24.6 M 52 45 L 62.5 26 M 57.5 43 L 67 28"
          fill="none"
          stroke={p.ink}
          strokeWidth={1.1}
          opacity={0.14}
        />
        <path
          d="M 28.5 43 C 29 32.5 36.5 22.8 46.5 21.2 C 38.5 24.8 32.5 33.5 31.5 43.5 Z"
          fill={p.light}
          opacity={0.3}
        />
        <path
          d="M 64.5 43 C 63.5 33 60 25.5 53 21.8 C 62 24.5 68.6 33.5 69.5 43 Z"
          fill={p.ink}
          opacity={0.22}
        />
        <path
          d="M 23.2 47 Q 48 51 72.8 47"
          fill="none"
          stroke={p.ink}
          strokeWidth={8.4}
          strokeLinecap="round"
        />
        <path
          d="M 23.2 47 Q 48 51 72.8 47"
          fill="none"
          stroke={p.accent}
          strokeWidth={5.4}
          strokeLinecap="round"
        />
        <path
          d="M 30.6 46.1 L 30.6 49.9 M 38.2 46.8 L 38.2 50.6 M 47.85 47 L 47.85 50.8 M 57.8 46.8 L 57.8 50.6 M 65.2 46.1 L 65.2 49.9"
          fill="none"
          stroke={p.ink}
          strokeWidth={1}
          opacity={0.3}
        />
        <path
          d="M 25.5 45.2 Q 48 48.6 70.5 45.2"
          fill="none"
          stroke={p.light}
          strokeWidth={1.3}
          opacity={0.5}
        />
        <circle
          cx={48}
          cy={16.8}
          r={4.5}
          fill={`url(#hw-pom-${uid})`}
          stroke={p.ink}
          strokeWidth={1.8}
        />
        <path
          d="M 44.6 14.4 L 43.4 12.9 M 51.4 14.4 L 52.6 12.9 M 44 19.2 L 42.6 20.2 M 52 19.2 L 53.4 20.2"
          fill="none"
          stroke={p.ink}
          strokeWidth={1.1}
          strokeLinecap="round"
          opacity={0.5}
        />
      </>
    ),
  },
  {
    id: "snapback",
    name: "Snapback",
    weight: 11,
    render: (p, uid) => (
      <>
        <defs>
          <linearGradient id={`hw-snap-crown-${uid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={p.light} />
            <stop offset="0.42" stopColor={p.accent} />
            <stop offset="1" stopColor={p.ink} />
          </linearGradient>
          <linearGradient id={`hw-snap-brim-${uid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={p.accent} />
            <stop offset="1" stopColor={p.ink} />
          </linearGradient>
        </defs>
        <path
          d="M 24.5 39 C 25.5 25 34.5 15.5 48 15.5 C 61.5 15.5 70.5 25 71.5 39 Z"
          fill={`url(#hw-snap-crown-${uid})`}
          stroke={p.ink}
          strokeWidth={2}
          strokeLinejoin="round"
        />
        <path
          d="M 48 16 C 44 21.5 41 30 40.5 38.6 M 48 16 C 52 21.5 55 30 55.5 38.6 M 48 16 C 38 21.5 31.5 30 29.5 38.6 M 48 16 C 58 21.5 64.5 30 66.5 38.6"
          fill="none"
          stroke={p.ink}
          strokeWidth={1.2}
          opacity={0.28}
        />
        <path
          d="M 32 22.5 C 36.5 17.5 42 15.8 47.5 15.7 C 40 18.7 35 24.5 33.2 31.5 C 32.6 28.5 32.4 25.5 32 22.5 Z"
          fill={p.light}
          opacity={0.32}
        />
        <circle cx={31} cy={23} r={1} fill={p.ink} opacity={0.35} />
        <circle cx={28.5} cy={26.5} r={1} fill={p.ink} opacity={0.35} />
        <circle cx={27} cy={30} r={1} fill={p.ink} opacity={0.35} />
        <circle cx={65} cy={23} r={1} fill={p.ink} opacity={0.35} />
        <circle cx={67.5} cy={26.5} r={1} fill={p.ink} opacity={0.35} />
        <circle cx={69} cy={30} r={1} fill={p.ink} opacity={0.35} />
        <path
          d="M 48 24.5 L 52 28.5 L 48 32.5 L 44 28.5 Z"
          fill={p.light}
          stroke={p.ink}
          strokeWidth={1.3}
          strokeLinejoin="round"
        />
        <circle cx={48} cy={28.5} r={1.1} fill={p.accent} />
        <path
          d="M 17 41 C 22 47.5 34 49.5 48 49.5 C 62 49.5 74 47.5 79 41 C 72 44 60 42.5 48 42.5 C 36 42.5 24 44 17 41 Z"
          fill={`url(#hw-snap-brim-${uid})`}
          stroke={p.ink}
          strokeWidth={2}
          strokeLinejoin="round"
        />
        <path
          d="M 20.5 41.8 C 27 44.6 37 45.9 48 45.9 C 59 45.9 69 44.6 75.5 41.8"
          fill="none"
          stroke={p.light}
          strokeWidth={1.4}
          strokeLinecap="round"
          opacity={0.4}
        />
        <path
          d="M 18.5 41 C 25 43.9 36 42.5 48 42.5 C 60 42.5 71 43.9 77.5 41"
          fill="none"
          stroke={p.ink}
          strokeWidth={1.1}
          opacity={0.45}
        />
        <circle
          cx={48}
          cy={15.7}
          r={2.3}
          fill={p.accent}
          stroke={p.ink}
          strokeWidth={1.3}
        />
      </>
    ),
  },
  {
    id: "bucket-hat",
    name: "Bucket Hat",
    weight: 10,
    render: (p, uid) => (
      <>
        <defs>
          <linearGradient id={`hw-bucket-crown-${uid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={p.light} />
            <stop offset="0.4" stopColor={p.accent} />
            <stop offset="1" stopColor={p.ink} />
          </linearGradient>
          <linearGradient id={`hw-bucket-brim-${uid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={p.accent} />
            <stop offset="1" stopColor={p.ink} />
          </linearGradient>
        </defs>
        <path
          d="M 25 40 C 26 27.5 34.5 20 48 20 C 61.5 20 70 27.5 71 40 Q 48 44.5 25 40 Z"
          fill={`url(#hw-bucket-crown-${uid})`}
          stroke={p.ink}
          strokeWidth={2}
          strokeLinejoin="round"
        />
        <path
          d="M 32 39 C 33.5 31 38 24.8 44 22.4 M 64 39 C 62.5 31 58 24.8 52 22.4"
          fill="none"
          stroke={p.ink}
          strokeWidth={1.2}
          opacity={0.2}
        />
        <path
          d="M 30.5 37 C 31 28.5 37 22.5 45 21.2 C 38.5 24.6 34 31 33.5 37.5 Z"
          fill={p.light}
          opacity={0.28}
        />
        <path
          d="M 15 40 C 15 50.5 30 54.5 48 54.5 C 66 54.5 81 50.5 81 40 C 72 45 60 46.5 48 46.5 C 36 46.5 24 45 15 40 Z"
          fill={`url(#hw-bucket-brim-${uid})`}
          stroke={p.ink}
          strokeWidth={2}
          strokeLinejoin="round"
        />
        <path
          d="M 17 40.8 C 26 43.6 36 44.6 48 44.6 C 60 44.6 70 43.6 79 40.8"
          fill="none"
          stroke={p.light}
          strokeWidth={1.5}
          strokeLinecap="round"
          opacity={0.35}
        />
        <path
          d="M 18.5 42.6 C 25 49.4 34.5 52 48 52 C 61.5 52 71 49.4 77.5 42.6"
          fill="none"
          stroke={p.ink}
          strokeWidth={1.4}
          strokeLinecap="round"
          opacity={0.28}
        />
        <path
          d="M 26.5 39.6 Q 48 43.8 69.5 39.6"
          fill="none"
          stroke={p.ink}
          strokeWidth={5.6}
          strokeLinecap="round"
        />
        <path
          d="M 26.5 39.6 Q 48 43.8 69.5 39.6"
          fill="none"
          stroke={p.accent}
          strokeWidth={3.2}
          strokeLinecap="round"
        />
      </>
    ),
  },
  {
    id: "headphones",
    name: "Wired Headphones",
    weight: 5,
    render: (p, uid) => (
      <>
        <defs>
          <linearGradient id={`hw-hp-band-${uid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={p.light} />
            <stop offset="0.5" stopColor={p.accent} />
            <stop offset="1" stopColor={p.ink} />
          </linearGradient>
          <linearGradient id={`hw-hp-cup-${uid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={p.light} />
            <stop offset="0.45" stopColor={p.accent} />
            <stop offset="1" stopColor={p.ink} />
          </linearGradient>
        </defs>
        <path
          d="M 21 52 C 21 27.5 32 16.5 48 16.5 C 64 16.5 75 27.5 75 52 L 69.5 52 C 69.5 31 60.5 22 48 22 C 35.5 22 26.5 31 26.5 52 Z"
          fill={`url(#hw-hp-band-${uid})`}
          stroke={p.ink}
          strokeWidth={2}
          strokeLinejoin="round"
        />
        <path
          d="M 24 40 C 24.5 29 31 20.5 42 17.5"
          fill="none"
          stroke={p.light}
          strokeWidth={1.5}
          strokeLinecap="round"
          opacity={0.5}
        />
        <rect
          x={16.5}
          y={43.5}
          width={12}
          height={17}
          rx={5}
          fill={`url(#hw-hp-cup-${uid})`}
          stroke={p.ink}
          strokeWidth={2}
        />
        <rect
          x={67.5}
          y={43.5}
          width={12}
          height={17}
          rx={5}
          fill={`url(#hw-hp-cup-${uid})`}
          stroke={p.ink}
          strokeWidth={2}
        />
        <rect
          x={19}
          y={47}
          width={7}
          height={10}
          rx={3.5}
          fill={p.ink}
          opacity={0.65}
        />
        <rect
          x={70}
          y={47}
          width={7}
          height={10}
          rx={3.5}
          fill={p.ink}
          opacity={0.65}
        />
        <path
          d="M 18.5 46 C 18 50 18 54 18.5 58"
          fill="none"
          stroke={p.light}
          strokeWidth={1.2}
          strokeLinecap="round"
          opacity={0.45}
        />
        <path
          d="M 77.5 46 C 78 50 78 54 77.5 58"
          fill="none"
          stroke={p.light}
          strokeWidth={1.2}
          strokeLinecap="round"
          opacity={0.45}
        />
        <circle cx={22.5} cy={58.5} r={3.2} fill={p.accent} opacity={0.28} />
        <circle cx={22.5} cy={58.5} r={1.4} fill={p.light} />
        <circle cx={73.5} cy={45.5} r={1.1} fill={p.light} opacity={0.7} />
      </>
    ),
  },
  {
    id: "vr-visor",
    name: "VR Visor Band",
    weight: 5,
    render: (p, uid) => (
      <>
        <defs>
          <linearGradient id={`hw-vr-body-${uid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={p.accent} />
            <stop offset="0.45" stopColor={p.ink} />
            <stop offset="1" stopColor={p.ink} />
          </linearGradient>
          <linearGradient id={`hw-vr-lens-${uid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={p.light} stopOpacity={0.95} />
            <stop offset="0.55" stopColor={p.accent} stopOpacity={0.85} />
            <stop offset="1" stopColor={p.accent} stopOpacity={0.35} />
          </linearGradient>
        </defs>
        <rect x={20} y={36} width={4} height={8} rx={2} fill={p.ink} />
        <rect x={72} y={36} width={4} height={8} rx={2} fill={p.ink} />
        <path
          d="M 24 36.5 C 25 28.5 32.5 24 48 24 C 63.5 24 71 28.5 72 36.5 C 72 39.5 70.5 42 68.5 43.5 L 27.5 43.5 C 25.5 42 24 39.5 24 36.5 Z"
          fill={`url(#hw-vr-body-${uid})`}
          stroke={p.ink}
          strokeWidth={2}
          strokeLinejoin="round"
        />
        <path
          d="M 29.5 33.5 C 30.5 30 37 28.3 48 28.3 C 59 28.3 65.5 30 66.5 33.5 C 66.5 37.5 60 40.5 48 40.5 C 36 40.5 29.5 37.5 29.5 33.5 Z"
          fill={`url(#hw-vr-lens-${uid})`}
          stroke={p.ink}
          strokeWidth={1.6}
        />
        <path
          d="M 31.5 34 C 38 32.2 58 32.2 64.5 34 M 30.5 37 C 38 35.2 58 35.2 65.5 37"
          fill="none"
          stroke={p.ink}
          strokeWidth={1}
          opacity={0.25}
        />
        <circle cx={38} cy={31.5} r={1.3} fill={p.light} opacity={0.9} />
        <circle cx={58} cy={31.5} r={1.3} fill={p.light} opacity={0.9} />
        <path
          d="M 27 28.5 C 33 25.8 42 24.5 48 24.5 C 54 24.5 63 25.8 69 28.5"
          fill="none"
          stroke={p.light}
          strokeWidth={1.6}
          strokeLinecap="round"
          opacity={0.55}
        />
        <path
          d="M 70.5 28 L 74.5 21.5"
          fill="none"
          stroke={p.ink}
          strokeWidth={2.2}
          strokeLinecap="round"
        />
        <circle cx={75} cy={20.5} r={3.4} fill={p.accent} opacity={0.3} />
        <circle
          cx={75}
          cy={20.5}
          r={2}
          fill={p.accent}
          stroke={p.ink}
          strokeWidth={1.3}
        />
        <circle cx={74.5} cy={20} r={0.7} fill={p.light} />
        <circle cx={25.5} cy={40.5} r={2.8} fill={p.light} opacity={0.25} />
        <circle cx={25.5} cy={40.5} r={1.4} fill={p.light} />
      </>
    ),
  },
  {
    id: "halo",
    name: "Halo",
    weight: 3,
    render: (p, uid) => (
      <>
        <defs>
          <linearGradient id={`hw-halo-ring-${uid}`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor={p.accent} />
            <stop offset="0.5" stopColor={p.light} />
            <stop offset="1" stopColor={p.accent} />
          </linearGradient>
        </defs>
        <ellipse cx={48} cy={17} rx={17} ry={5.6} fill={p.accent} opacity={0.14} />
        <ellipse cx={48} cy={17} rx={14.5} ry={4.6} fill={p.accent} opacity={0.2} />
        <ellipse
          cx={48}
          cy={17}
          rx={13.5}
          ry={4.2}
          fill="none"
          stroke={p.ink}
          strokeWidth={5.4}
          opacity={0.85}
        />
        <ellipse
          cx={48}
          cy={17}
          rx={13.5}
          ry={4.2}
          fill="none"
          stroke={`url(#hw-halo-ring-${uid})`}
          strokeWidth={2.7}
        />
        <ellipse
          cx={48}
          cy={17.5}
          rx={13.5}
          ry={4.4}
          fill="none"
          stroke={p.accent}
          strokeWidth={1.1}
          opacity={0.8}
        />
        <path
          d="M 40 21.5 L 39 25 M 48 22 L 48 26 M 56 21.5 L 57 25"
          fill="none"
          stroke={p.light}
          strokeWidth={1.6}
          strokeLinecap="round"
          opacity={0.5}
        />
        <path
          d="M 30 15 Q 30.5 12.7 33 12 Q 30.5 11.3 30 9 Q 29.5 11.3 27 12 Q 29.5 12.7 30 15 Z"
          fill={p.light}
        />
        <path
          d="M 66 16 Q 66.4 14.2 68.3 13.6 Q 66.4 13 66 11.2 Q 65.6 13 63.7 13.6 Q 65.6 14.2 66 16 Z"
          fill={p.light}
          opacity={0.9}
        />
        <path
          d="M 53 9.5 Q 53.3 8.2 54.7 7.8 Q 53.3 7.4 53 6.1 Q 52.7 7.4 51.3 7.8 Q 52.7 8.2 53 9.5 Z"
          fill={p.light}
          opacity={0.8}
        />
      </>
    ),
  },
  {
    id: "wizard-hat",
    name: "Wizard Hat",
    weight: 2,
    render: (p, uid) => (
      <>
        <defs>
          <linearGradient id={`hw-wiz-cone-${uid}`} x1="0" y1="0" x2="0.8" y2="1">
            <stop offset="0" stopColor={p.light} />
            <stop offset="0.42" stopColor={p.accent} />
            <stop offset="1" stopColor={p.ink} />
          </linearGradient>
          <linearGradient id={`hw-wiz-brim-${uid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={p.accent} />
            <stop offset="1" stopColor={p.ink} />
          </linearGradient>
        </defs>
        <path
          d="M 29 39 C 33 22 42 11.5 51.5 5.5 C 55 3.6 58.8 5.4 57 9.6 C 55.4 13.3 53.8 15.6 55.6 20.4 C 58.6 27.5 63 33 67 39 Z"
          fill={`url(#hw-wiz-cone-${uid})`}
          stroke={p.ink}
          strokeWidth={2}
          strokeLinejoin="round"
        />
        <path
          d="M 35 36 C 38 28 43 19 49 12 M 61 36 C 59 28 56 21 54 14"
          fill="none"
          stroke={p.ink}
          strokeWidth={1.2}
          opacity={0.18}
        />
        <path
          d="M 32.5 37 C 35 26 41 15.5 48 9.5 C 43 14 38.5 22 37 30 C 36.4 32.6 36 35 35.5 37 Z"
          fill={p.light}
          opacity={0.3}
        />
        <path
          d="M 40 20 Q 40.5 22.5 43 23 Q 40.5 23.5 40 26 Q 39.5 23.5 37 23 Q 39.5 22.5 40 20 Z"
          fill={p.light}
        />
        <path
          d="M 49.5 13.3 Q 49.9 15.1 51.7 15.6 Q 49.9 16.1 49.5 17.9 Q 49.1 16.1 47.3 15.6 Q 49.1 15.1 49.5 13.3 Z"
          fill={p.light}
          opacity={0.9}
        />
        <path
          d="M 57.5 23.3 Q 57.9 25.3 60 25.8 Q 57.9 26.3 57.5 28.3 Q 57.1 26.3 55 25.8 Q 57.1 25.3 57.5 23.3 Z"
          fill={p.light}
          opacity={0.85}
        />
        <path
          d="M 45.5 28.7 Q 45.8 30.2 47.3 30.5 Q 45.8 30.8 45.5 32.3 Q 45.2 30.8 43.7 30.5 Q 45.2 30.2 45.5 28.7 Z"
          fill={p.light}
          opacity={0.8}
        />
        <path
          d="M 52 29.7 Q 52.2 30.8 53.3 31 Q 52.2 31.2 52 32.3 Q 51.8 31.2 50.7 31 Q 51.8 30.8 52 29.7 Z"
          fill={p.light}
          opacity={0.8}
        />
        <path
          d="M 16 40 C 16 47 30 51.5 48 51.5 C 66 51.5 80 47 80 40 C 69 44 58 45 48 45 C 38 45 27 44 16 40 Z"
          fill={`url(#hw-wiz-brim-${uid})`}
          stroke={p.ink}
          strokeWidth={2}
          strokeLinejoin="round"
        />
        <path
          d="M 18.5 41 C 26 44 38 45 48 45 C 58 45 70 44 77.5 41"
          fill="none"
          stroke={p.light}
          strokeWidth={1.3}
          strokeLinecap="round"
          opacity={0.4}
        />
        <path
          d="M 30.2 35.4 Q 48 40 65.8 35.4"
          fill="none"
          stroke={p.ink}
          strokeWidth={7}
          strokeLinecap="round"
        />
        <path
          d="M 30.2 35.4 Q 48 40 65.8 35.4"
          fill="none"
          stroke={p.light}
          strokeWidth={4}
          strokeLinecap="round"
        />
        <rect
          x={44.5}
          y={33.8}
          width={7}
          height={5.4}
          rx={1}
          fill={p.ink}
          stroke={p.light}
          strokeWidth={1.1}
        />
        <path
          d="M 48 33.8 L 48 39.2"
          fill="none"
          stroke={p.light}
          strokeWidth={1}
          opacity={0.8}
        />
      </>
    ),
  },
  {
    id: "crown",
    name: "Jeweled Crown",
    weight: 2,
    render: (p, uid) => (
      <>
        <defs>
          <linearGradient id={`hw-crown-gold-${uid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={p.light} />
            <stop offset="0.4" stopColor={p.accent} />
            <stop offset="1" stopColor={p.ink} />
          </linearGradient>
        </defs>
        <path
          d="M 29 37 C 34 30 42 26.5 48 26.5 C 54 26.5 62 30 67 37 Q 48 42 29 37 Z"
          fill={p.ink}
          opacity={0.55}
        />
        <path
          d="M 27 36.5 L 30.5 22.5 L 36.5 31.5 L 42 16.5 L 48 29.5 L 54 16.5 L 59.5 31.5 L 65.5 22.5 L 69 36.5 Z"
          fill={`url(#hw-crown-gold-${uid})`}
          stroke={p.ink}
          strokeWidth={2}
          strokeLinejoin="round"
        />
        <path
          d="M 27 36.5 Q 48 43.5 69 36.5 L 69 44 Q 48 51 27 44 Z"
          fill={`url(#hw-crown-gold-${uid})`}
          stroke={p.ink}
          strokeWidth={2}
          strokeLinejoin="round"
        />
        <path
          d="M 30.5 22.5 L 34 31 L 35.5 29.5 L 33 23.5 Z"
          fill={p.light}
          opacity={0.8}
        />
        <path
          d="M 42 16.5 L 44.5 25 L 46 24 L 43.5 17.8 Z"
          fill={p.light}
          opacity={0.8}
        />
        <path
          d="M 54 16.5 L 51.5 25 L 50 24 L 52.5 17.8 Z"
          fill={p.light}
          opacity={0.8}
        />
        <path
          d="M 65.5 22.5 L 62 31 L 60.5 29.5 L 63 23.5 Z"
          fill={p.light}
          opacity={0.8}
        />
        <path
          d="M 29.5 37.5 Q 48 44 66.5 37.5"
          fill="none"
          stroke={p.light}
          strokeWidth={1.4}
          strokeLinecap="round"
          opacity={0.5}
        />
        <circle cx={30.5} cy={22.5} r={2} fill={p.accent} stroke={p.ink} strokeWidth={1.2} />
        <circle cx={42} cy={16.5} r={2} fill={p.light} stroke={p.ink} strokeWidth={1.2} />
        <circle cx={54} cy={16.5} r={2} fill={p.light} stroke={p.ink} strokeWidth={1.2} />
        <circle cx={65.5} cy={22.5} r={2} fill={p.accent} stroke={p.ink} strokeWidth={1.2} />
        <circle cx={33.5} cy={41.5} r={2.2} fill={p.light} stroke={p.ink} strokeWidth={1.2} />
        <circle cx={48} cy={46.8} r={2.2} fill={p.accent} stroke={p.ink} strokeWidth={1.2} />
        <circle cx={62.5} cy={41.5} r={2.2} fill={p.light} stroke={p.ink} strokeWidth={1.2} />
        <circle cx={33} cy={41} r={0.7} fill={p.light} opacity={0.9} />
        <circle cx={47.5} cy={46.2} r={0.7} fill={p.light} opacity={0.9} />
        <circle cx={62} cy={41} r={0.7} fill={p.light} opacity={0.9} />
        <circle cx={30} cy={45.3} r={0.8} fill={p.light} opacity={0.8} />
        <circle cx={38} cy={47.9} r={0.8} fill={p.light} opacity={0.8} />
        <circle cx={44} cy={49.3} r={0.8} fill={p.light} opacity={0.8} />
        <circle cx={52} cy={49.3} r={0.8} fill={p.light} opacity={0.8} />
        <circle cx={58} cy={47.9} r={0.8} fill={p.light} opacity={0.8} />
        <circle cx={66} cy={45.3} r={0.8} fill={p.light} opacity={0.8} />
      </>
    ),
  },
  {
    id: "propeller-cap",
    name: "Propeller Cap",
    weight: 3,
    render: (p, uid) => (
      <>
        <defs>
          <linearGradient id={`hw-prop-dome-${uid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={p.light} />
            <stop offset="0.45" stopColor={p.accent} />
            <stop offset="1" stopColor={p.ink} />
          </linearGradient>
          <linearGradient id={`hw-prop-visor-${uid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={p.accent} />
            <stop offset="1" stopColor={p.ink} />
          </linearGradient>
        </defs>
        <path
          d="M 22.5 40.5 C 22.5 45.5 33 48.5 48 48.5 C 63 48.5 73.5 45.5 73.5 40.5 C 64 44 56 44.8 48 44.8 C 40 44.8 32 44 22.5 40.5 Z"
          fill={`url(#hw-prop-visor-${uid})`}
          stroke={p.ink}
          strokeWidth={2}
          strokeLinejoin="round"
        />
        <path
          d="M 23.5 41 C 24.5 28.5 33.5 21 48 21 C 62.5 21 71.5 28.5 72.5 41 Q 48 44.6 23.5 41 Z"
          fill={`url(#hw-prop-dome-${uid})`}
          stroke={p.ink}
          strokeWidth={2}
          strokeLinejoin="round"
        />
        <path
          d="M 48 21.2 C 44.5 26.5 42.5 33 42 41.3 M 48 21.2 C 51.5 26.5 53.5 33 54 41.3"
          fill="none"
          stroke={p.ink}
          strokeWidth={1.2}
          opacity={0.25}
        />
        <path
          d="M 29 37.5 C 29.5 29.5 35.5 23.8 44 22 C 37 25.6 33 31.8 32.5 38 Z"
          fill={p.light}
          opacity={0.3}
        />
        <path d="M 48 21 L 48 14.5" fill="none" stroke={p.ink} strokeWidth={2} />
        <ellipse
          cx={40}
          cy={13.2}
          rx={8.2}
          ry={2.7}
          transform="rotate(-8 40 13.2)"
          fill={p.light}
          stroke={p.ink}
          strokeWidth={1.4}
        />
        <ellipse
          cx={56}
          cy={13.2}
          rx={8.2}
          ry={2.7}
          transform="rotate(8 56 13.2)"
          fill={p.light}
          stroke={p.ink}
          strokeWidth={1.4}
        />
        <circle
          cx={48}
          cy={13.6}
          r={2.4}
          fill={p.accent}
          stroke={p.ink}
          strokeWidth={1.6}
        />
        <circle cx={47.3} cy={12.9} r={0.7} fill={p.light} />
        <path
          d="M 29.5 6.5 Q 48 0.6 66.5 6.5"
          fill="none"
          stroke={p.light}
          strokeWidth={1.7}
          strokeLinecap="round"
          opacity={0.45}
        />
        <path
          d="M 34 4 Q 48 0.4 62 4"
          fill="none"
          stroke={p.light}
          strokeWidth={1.3}
          strokeLinecap="round"
          opacity={0.25}
        />
        <circle
          cx={48}
          cy={21}
          r={2.2}
          fill={p.light}
          stroke={p.ink}
          strokeWidth={1.3}
        />
      </>
    ),
  },
  {
    id: "durag",
    name: "Durag",
    weight: 4,
    render: (p, uid) => (
      <>
        <defs>
          <linearGradient id={`hw-durag-${uid}`} x1="0" y1="0" x2="0.25" y2="1">
            <stop offset="0" stopColor={p.accent} />
            <stop offset="0.4" stopColor={p.ink} />
            <stop offset="1" stopColor="#07070c" />
          </linearGradient>
          <linearGradient id={`hw-durag-band-${uid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={p.ink} />
            <stop offset="1" stopColor="#05050a" />
          </linearGradient>
        </defs>
        <path
          d="M70 34 C76.5 38 78.5 45 76.8 53.5 C74.6 52 72.8 51.2 71 50.8 C73.8 45.2 74 39.5 70 34 Z"
          fill={`url(#hw-durag-band-${uid})`}
          stroke={p.ink}
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
        <path d="M72.2 36.5 C76 40.8 77.4 46.4 76.6 51.4" fill="none" stroke={p.light} strokeWidth="1" opacity="0.3" strokeLinecap="round" />
        <path
          d="M21.5 42.5 C22.5 28.5 33 18.5 48 18.5 C63 18.5 73.5 28.5 74.5 42.5 Q61 38.8 48 38.8 Q35 38.8 21.5 42.5 Z"
          fill={`url(#hw-durag-${uid})`}
          stroke={p.ink}
          strokeWidth="2"
          strokeLinejoin="round"
        />
        <path
          d="M30 40 C30.5 31 36.5 23.5 45 20.5 M48 19 C44 24 41 31.5 40.5 39.5 M48 19 C52 24 55 31.5 55.5 39.5 M66 40 C65.5 31 59.5 23.5 51 20.5"
          fill="none"
          stroke={p.ink}
          strokeWidth="1.1"
          opacity="0.3"
        />
        <path
          d="M27 39.5 C28 29.5 36 21.5 45.5 20 C37.5 23.5 31.5 30.5 30.5 39.8 Z"
          fill={p.light}
          opacity="0.22"
        />
        <path d="M21.5 42.5 Q48 46.8 74.5 42.5" fill="none" stroke={`url(#hw-durag-band-${uid})`} strokeWidth="5.2" strokeLinecap="round" />
        <path d="M21.5 42.5 Q48 46.8 74.5 42.5" fill="none" stroke={p.light} strokeWidth="1.1" opacity="0.25" />
        <path
          d="M25 43.6 Q48 47.6 71 43.6"
          fill="none"
          stroke={p.accent}
          strokeWidth="0.8"
          strokeDasharray="1.5 2.5"
          opacity="0.6"
        />
      </>
    ),
  },
  {
    id: "bandana",
    name: "Bandana",
    weight: 4,
    render: (p, uid) => (
      <>
        <defs>
          <linearGradient id={`hw-bandana-${uid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={p.light} />
            <stop offset="0.45" stopColor={p.accent} />
            <stop offset="1" stopColor={p.ink} />
          </linearGradient>
        </defs>
        <path
          d="M66.5 33.5 C73.5 35.5 77.8 40 79 46.8 C76 45.6 73.8 45.5 71.6 46 C74.4 41.4 72 37.2 66.5 33.5 Z"
          fill={`url(#hw-bandana-${uid})`}
          stroke={p.ink}
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
        <path d="M68.6 36 C72.8 38.6 75.4 42.2 76.3 45.9" fill="none" stroke={p.ink} strokeWidth="0.9" opacity="0.3" />
        <path
          d="M21.5 41 C22.8 31 32.5 25 48 25 C63.5 25 73.2 31 74.5 41 Q61 36.4 48 36.4 Q35 36.4 21.5 41 Z"
          fill={`url(#hw-bandana-${uid})`}
          stroke={p.ink}
          strokeWidth="2"
          strokeLinejoin="round"
        />
        <path
          d="M27 37.5 C29 30.5 36.5 27 46 26.8 C38.5 29.5 32.5 34.5 30.5 39.8 Z"
          fill={p.light}
          opacity="0.3"
        />
        <path d="M22.5 39.8 Q48 43.8 73.5 39.8" fill="none" stroke={p.ink} strokeWidth="1.3" opacity="0.35" />
        <circle cx={30} cy={32.5} r={1.1} fill={p.ink} opacity="0.35" />
        <circle cx={39} cy={29.5} r={1.1} fill={p.ink} opacity="0.35" />
        <circle cx={48} cy={28.6} r={1.1} fill={p.ink} opacity="0.35" />
        <circle cx={57} cy={29.5} r={1.1} fill={p.ink} opacity="0.35" />
        <circle cx={66} cy={32.5} r={1.1} fill={p.ink} opacity="0.35" />
        <circle cx={34.5} cy={34.8} r={1.1} fill={p.ink} opacity="0.35" />
        <circle cx={61.5} cy={34.8} r={1.1} fill={p.ink} opacity="0.35" />
        <circle cx={43.5} cy={32.4} r={1.1} fill={p.ink} opacity="0.35" />
        <circle cx={52.5} cy={32.4} r={1.1} fill={p.ink} opacity="0.35" />
        <path
          d="M69.5 31.5 L77 30.5 L73.4 36.8 L68.2 37.4 Z"
          fill={`url(#hw-bandana-${uid})`}
          stroke={p.ink}
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
        <path d="M70.5 32.6 L74.8 32.2 M69.6 35 L73 34.4" stroke={p.light} strokeWidth="1" opacity="0.5" strokeLinecap="round" />
      </>
    ),
  },
  {
    id: "mohawk",
    name: "Mohawk",
    weight: 3,
    render: (p, uid) => (
      <>
        <defs>
          <linearGradient id={`hw-mohawk-${uid}`} x1="0" y1="1" x2="0.2" y2="0">
            <stop offset="0" stopColor={p.ink} />
            <stop offset="0.55" stopColor={p.accent} />
            <stop offset="1" stopColor={p.light} />
          </linearGradient>
        </defs>
        <path
          d="M27.5 32.5 C26 26.5 26.5 21.5 28.5 17.5 C31 21.5 33.5 26 35.5 30.5 Z"
          fill={`url(#hw-mohawk-${uid})`}
          stroke={p.ink}
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
        <path
          d="M35.5 29 C34 23 35 17 37.5 11.5 C40.5 16.5 43.5 22 45.5 27 Z"
          fill={`url(#hw-mohawk-${uid})`}
          stroke={p.ink}
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
        <path
          d="M44.5 26.5 C43.5 19.5 44.5 11.5 48 4.5 C51.5 11.5 52.5 19.5 51.5 26.5 Z"
          fill={`url(#hw-mohawk-${uid})`}
          stroke={p.ink}
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
        <path
          d="M60.5 29 C62 23 61 17 58.5 11.5 C55.5 16.5 52.5 22 50.5 27 Z"
          fill={`url(#hw-mohawk-${uid})`}
          stroke={p.ink}
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
        <path
          d="M68.5 32.5 C70 26.5 69.5 21.5 67.5 17.5 C65 21.5 62.5 26 60.5 30.5 Z"
          fill={`url(#hw-mohawk-${uid})`}
          stroke={p.ink}
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
        <path
          d="M29.5 18.5 C31.2 22 33 26 34.4 29.8 M38.4 12.5 C40.6 17.2 42.8 22.2 44.4 26.4 M48 6 C49.6 11.4 50.4 18.8 51.1 25.6 M57.6 12.5 C55.4 17.2 53.2 22.2 51.6 26.4 M66.5 18.5 C64.8 22 63 26 61.6 29.8"
          fill="none"
          stroke={p.light}
          strokeWidth="1"
          opacity="0.5"
          strokeLinecap="round"
        />
      </>
    ),
  },
];
