import type { Trait } from "../types";

/** Soft base layer behind the shoulders. */
export const CLOTHING_TRAITS: Trait[] = [
  {
    id: "plain-tee",
    name: "Plain Tee",
    weight: 14,
    render: (p, uid) => (
      <>
        <defs>
          <linearGradient id={`cl-tee-${uid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={p.light} />
            <stop offset="0.38" stopColor={p.accent} />
            <stop offset="1" stopColor={p.ink} />
          </linearGradient>
        </defs>
        <path
          d="M 48 72 C 34 72 20 76 13 82 C 7 86.5 4.5 91 4 96 L 92 96 C 91.5 91 89 86.5 83 82 C 76 76 62 72 48 72 Z"
          fill={`url(#cl-tee-${uid})`}
          stroke={p.ink}
          strokeWidth={2}
          strokeLinejoin="round"
        />
        <path
          d="M 32 73.5 C 24 75.5 17 79.5 13.5 83.5 C 9.5 87.5 7 92 6.5 96 L 15 96 C 16.5 89 22.5 81.5 34 77.5 Z"
          fill={p.light}
          opacity={0.18}
        />
        <path
          d="M 18 84 C 24 79.5 34 76 44 74.8"
          fill="none"
          stroke={p.light}
          strokeWidth={1.6}
          strokeLinecap="round"
          opacity={0.45}
        />
        <path
          d="M 38.5 74 C 42 80 54 80 57.5 74"
          fill="none"
          stroke={p.ink}
          strokeWidth={3.6}
        />
        <path
          d="M 38.5 74 C 42 80 54 80 57.5 74"
          fill="none"
          stroke={p.accent}
          strokeWidth={1.7}
        />
        <path
          d="M 15.5 82.5 C 20 88 21 92 20.5 96"
          fill="none"
          stroke={p.ink}
          strokeWidth={1.3}
          opacity={0.3}
        />
        <path
          d="M 80.5 82.5 C 76 88 75 92 75.5 96"
          fill="none"
          stroke={p.ink}
          strokeWidth={1.3}
          opacity={0.3}
        />
        <path
          d="M 33 84 C 38 88 38 92 36.5 96 M 60 83 C 58 88 59 93 60.5 96 M 24 88 C 27 90.5 28 93.5 27.5 96 M 72 88 C 69 90.5 68 93.5 68.5 96"
          fill="none"
          stroke={p.ink}
          strokeWidth={1.6}
          strokeLinecap="round"
          opacity={0.22}
        />
        <path
          d="M 40 78 C 44 80.5 52 80.5 56 78"
          fill="none"
          stroke={p.ink}
          strokeWidth={2}
          strokeLinecap="round"
          opacity={0.2}
        />
        <path
          d="M 8 93.5 C 30 91.5 66 91.5 88 93.5"
          fill="none"
          stroke={p.light}
          strokeWidth={1}
          strokeDasharray="2 3"
          opacity={0.3}
        />
      </>
    ),
  },
  {
    id: "hoodie",
    name: "Hoodie",
    weight: 12,
    render: (p, uid) => (
      <>
        <defs>
          <linearGradient id={`cl-hoodie-${uid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={p.light} />
            <stop offset="0.4" stopColor={p.accent} />
            <stop offset="1" stopColor={p.ink} />
          </linearGradient>
          <linearGradient id={`cl-hoodie-hood-${uid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={p.accent} />
            <stop offset="1" stopColor={p.ink} />
          </linearGradient>
        </defs>
        <path
          d="M 26 82 C 24 70 33 61 48 61 C 63 61 72 70 70 82 C 60 76 36 76 26 82 Z"
          fill={`url(#cl-hoodie-hood-${uid})`}
          stroke={p.ink}
          strokeWidth={2}
          strokeLinejoin="round"
        />
        <path
          d="M 30 78 C 32 70 38 64 48 63.5 C 58 64 64 70 66 78"
          fill="none"
          stroke={p.ink}
          strokeWidth={2}
          opacity={0.25}
        />
        <path
          d="M 29 79 C 30 70.5 37 63.5 46 62.5"
          fill="none"
          stroke={p.light}
          strokeWidth={1.5}
          strokeLinecap="round"
          opacity={0.35}
        />
        <path
          d="M 48 71 C 33 71 18 75.5 11 82 C 5.5 86.5 3.5 91.5 3 96 L 93 96 C 92.5 91.5 90.5 86.5 85 82 C 78 75.5 63 71 48 71 Z"
          fill={`url(#cl-hoodie-${uid})`}
          stroke={p.ink}
          strokeWidth={2}
          strokeLinejoin="round"
        />
        <path
          d="M 16 84 C 23 78.5 34 74.5 44 73.4"
          fill="none"
          stroke={p.light}
          strokeWidth={1.7}
          strokeLinecap="round"
          opacity={0.5}
        />
        <path
          d="M 33 82 C 36 86 36.5 90 35 95 M 62 81 C 60 86 60.5 91 62 95"
          fill="none"
          stroke={p.ink}
          strokeWidth={1.5}
          strokeLinecap="round"
          opacity={0.18}
        />
        <path
          d="M 44.5 78.5 C 44 83 43.6 87 44.2 91"
          fill="none"
          stroke={p.light}
          strokeWidth={1.8}
          strokeLinecap="round"
        />
        <path
          d="M 51.5 78.5 C 52 83 52.4 87 51.8 91"
          fill="none"
          stroke={p.light}
          strokeWidth={1.8}
          strokeLinecap="round"
        />
        <rect
          x={43.3}
          y={90.2}
          width={1.9}
          height={3.6}
          rx={0.9}
          fill={p.accent}
          stroke={p.ink}
          strokeWidth={0.8}
        />
        <rect
          x={50.8}
          y={90.2}
          width={1.9}
          height={3.6}
          rx={0.9}
          fill={p.accent}
          stroke={p.ink}
          strokeWidth={0.8}
        />
        <path
          d="M 28 87.5 C 40 84.5 56 84.5 68 87.5 C 70 92 66 96 48 96 C 30 96 26 92 28 87.5 Z"
          fill={p.ink}
          opacity={0.18}
        />
        <path
          d="M 28 87.5 C 40 84.5 56 84.5 68 87.5"
          fill="none"
          stroke={p.ink}
          strokeWidth={2}
          strokeLinecap="round"
          opacity={0.45}
        />
        <path
          d="M 17 87 C 20 90 21 93 20.5 96 M 79 87 C 76 90 75 93 75.5 96"
          fill="none"
          stroke={p.ink}
          strokeWidth={1.5}
          strokeLinecap="round"
          opacity={0.25}
        />
        <path
          d="M 4.5 92 C 30 94.5 66 94.5 91.5 92"
          fill="none"
          stroke={p.ink}
          strokeWidth={4.2}
          strokeLinecap="round"
        />
        <path
          d="M 4.5 92 C 30 94.5 66 94.5 91.5 92"
          fill="none"
          stroke={p.accent}
          strokeWidth={2.6}
          strokeLinecap="round"
        />
      </>
    ),
  },
  {
    id: "jersey",
    name: "Sports Jersey",
    weight: 10,
    render: (p, uid) => (
      <>
        <defs>
          <linearGradient id={`cl-jersey-${uid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={p.light} />
            <stop offset="0.4" stopColor={p.accent} />
            <stop offset="1" stopColor={p.ink} />
          </linearGradient>
        </defs>
        <path
          d="M 48 71 C 33 71 18 75.5 11 82 C 5.5 86.5 3.5 91.5 3 96 L 93 96 C 92.5 91.5 90.5 86.5 85 82 C 78 75.5 63 71 48 71 Z"
          fill={`url(#cl-jersey-${uid})`}
          stroke={p.ink}
          strokeWidth={2}
          strokeLinejoin="round"
        />
        <path
          d="M 30 74.5 C 21 77.5 14 82 11 86.5"
          fill="none"
          stroke={p.light}
          strokeWidth={2}
          strokeLinecap="round"
          opacity={0.35}
        />
        <path
          d="M 66 74.5 C 75 77.5 82 82 85 86.5"
          fill="none"
          stroke={p.ink}
          strokeWidth={2}
          strokeLinecap="round"
          opacity={0.25}
        />
        <path
          d="M 12.5 82.5 L 27 74 L 30.5 76.5 L 16 85 Z"
          fill={p.light}
          stroke={p.ink}
          strokeWidth={1.4}
          strokeLinejoin="round"
          opacity={0.9}
        />
        <path
          d="M 83.5 82.5 L 69 74 L 65.5 76.5 L 80 85 Z"
          fill={p.light}
          stroke={p.ink}
          strokeWidth={1.4}
          strokeLinejoin="round"
          opacity={0.9}
        />
        <path
          d="M 20 85 C 17.5 89 16.5 92.5 16.5 96 M 76 85 C 78.5 89 79.5 92.5 79.5 96"
          fill="none"
          stroke={p.ink}
          strokeWidth={1.3}
          opacity={0.3}
        />
        <path
          d="M 40 72 L 48 82 L 56 72"
          fill="none"
          stroke={p.ink}
          strokeWidth={5}
          strokeLinecap="round"
        />
        <path
          d="M 40 72 L 48 82 L 56 72"
          fill="none"
          stroke={p.light}
          strokeWidth={2.4}
          strokeLinecap="round"
        />
        <path
          d="M 33 84 C 34 88 33.5 92 32.5 96 M 63 84 C 62 88 62.5 92 63.5 96"
          fill="none"
          stroke={p.ink}
          strokeWidth={1.5}
          strokeLinecap="round"
          opacity={0.2}
        />
        <ellipse
          cx={42.5}
          cy={88.5}
          rx={4.6}
          ry={6.4}
          fill="none"
          stroke={p.ink}
          strokeWidth={5.2}
        />
        <ellipse
          cx={42.5}
          cy={88.5}
          rx={4.6}
          ry={6.4}
          fill="none"
          stroke={p.light}
          strokeWidth={2.8}
        />
        <path
          d="M 51.5 83 L 60 83 L 55.8 95.5"
          fill="none"
          stroke={p.ink}
          strokeWidth={5.2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M 51.5 83 L 60 83 L 55.8 95.5"
          fill="none"
          stroke={p.light}
          strokeWidth={2.8}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M 4 93 C 30 95.5 66 95.5 92 93"
          fill="none"
          stroke={p.ink}
          strokeWidth={4}
          strokeLinecap="round"
        />
        <path
          d="M 4 93 C 30 95.5 66 95.5 92 93"
          fill="none"
          stroke={p.light}
          strokeWidth={2.2}
          strokeLinecap="round"
        />
      </>
    ),
  },
  {
    id: "suit",
    name: "Suit & Tie",
    weight: 7,
    render: (p, uid) => (
      <>
        <defs>
          <linearGradient id={`cl-suit-${uid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={p.accent} />
            <stop offset="0.2" stopColor={p.bg[1]} />
            <stop offset="0.6" stopColor={p.ink} />
            <stop offset="1" stopColor={p.ink} />
          </linearGradient>
          <linearGradient id={`cl-suit-tie-${uid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={p.light} />
            <stop offset="0.45" stopColor={p.accent} />
            <stop offset="1" stopColor={p.ink} />
          </linearGradient>
        </defs>
        <path
          d="M 48 72 C 35 72 21 76.5 14.5 82.5 C 9 87 6.5 91.5 6 96 L 90 96 C 89.5 91.5 87 87 81.5 82.5 C 75 76.5 61 72 48 72 Z"
          fill={`url(#cl-suit-${uid})`}
          stroke={p.ink}
          strokeWidth={2}
          strokeLinejoin="round"
        />
        <path
          d="M 41.5 72.5 L 54.5 72.5 L 48 90 Z"
          fill={p.light}
          stroke={p.ink}
          strokeWidth={1.4}
          strokeLinejoin="round"
        />
        <path
          d="M 40.5 72.5 C 37 75 35 78 34 82 L 33 96 L 48 96 L 48 90 C 44 86 41 80 40.5 72.5 Z"
          fill={`url(#cl-suit-${uid})`}
          stroke={p.ink}
          strokeWidth={2}
          strokeLinejoin="round"
        />
        <path
          d="M 55.5 72.5 C 59 75 61 78 62 82 L 63 96 L 48 96 L 48 90 C 52 86 55 80 55.5 72.5 Z"
          fill={`url(#cl-suit-${uid})`}
          stroke={p.ink}
          strokeWidth={2}
          strokeLinejoin="round"
        />
        <path
          d="M 47 89.5 C 43.5 85.5 40.5 79.5 40 73.5"
          fill="none"
          stroke={p.light}
          strokeWidth={1.4}
          strokeLinecap="round"
          opacity={0.35}
        />
        <path
          d="M 49 89.5 C 52.5 85.5 55.5 79.5 56 73.5"
          fill="none"
          stroke={p.light}
          strokeWidth={1.4}
          strokeLinecap="round"
          opacity={0.35}
        />
        <path
          d="M 41.8 72.2 L 45 75.8 L 42.4 77.6 Z"
          fill={p.light}
          stroke={p.ink}
          strokeWidth={1}
          strokeLinejoin="round"
        />
        <path
          d="M 54.2 72.2 L 51 75.8 L 53.6 77.6 Z"
          fill={p.light}
          stroke={p.ink}
          strokeWidth={1}
          strokeLinejoin="round"
        />
        <path
          d="M 45.4 79.5 L 50.6 79.5 L 49.6 93.5 L 48 95.5 L 46.4 93.5 Z"
          fill={`url(#cl-suit-tie-${uid})`}
          stroke={p.ink}
          strokeWidth={1.6}
          strokeLinejoin="round"
        />
        <path
          d="M 45.8 75.5 L 50.2 75.5 L 51 79.5 L 45 79.5 Z"
          fill={`url(#cl-suit-tie-${uid})`}
          stroke={p.ink}
          strokeWidth={1.6}
          strokeLinejoin="round"
        />
        <path
          d="M 47 80.5 L 47.4 92.5"
          fill="none"
          stroke={p.light}
          strokeWidth={1}
          strokeLinecap="round"
          opacity={0.4}
        />
        <path
          d="M 13.5 82.5 C 20 77 32 73 43 72.3 M 82.5 82.5 C 76 77 64 73 53 72.3"
          fill="none"
          stroke={p.light}
          strokeWidth={1.5}
          strokeLinecap="round"
          opacity={0.3}
        />
        <path
          d="M 34 86.5 L 40 86.5 L 37 83 Z"
          fill={p.accent}
          stroke={p.ink}
          strokeWidth={0.9}
          strokeLinejoin="round"
        />
        <circle cx={48} cy={92} r={1.1} fill={p.light} opacity={0.8} />
      </>
    ),
  },
  {
    id: "lab-coat",
    name: "Lab Coat",
    weight: 6,
    render: (p, uid) => (
      <>
        <defs>
          <linearGradient id={`cl-lab-${uid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={p.light} />
            <stop offset="0.62" stopColor={p.light} />
            <stop offset="1" stopColor={p.accent} />
          </linearGradient>
        </defs>
        <path
          d="M 48 73 C 33 73 18 77 11 82.5 C 5.5 87 3.5 91.5 3 96 L 93 96 C 92.5 91.5 90.5 87 85 82.5 C 78 77 63 73 48 73 Z"
          fill={`url(#cl-lab-${uid})`}
          stroke={p.ink}
          strokeWidth={2}
          strokeLinejoin="round"
        />
        <path
          d="M 42 72.5 L 54 72.5 L 49.5 79 L 46.5 79 Z"
          fill={p.accent}
          stroke={p.ink}
          strokeWidth={1.4}
          strokeLinejoin="round"
        />
        <path
          d="M 41.5 72.5 L 46.5 79 L 44 96 L 37 96 L 39 83 Z"
          fill={p.light}
          stroke={p.ink}
          strokeWidth={1.8}
          strokeLinejoin="round"
        />
        <path
          d="M 54.5 72.5 L 49.5 79 L 52 96 L 59 96 L 57 83 Z"
          fill={p.light}
          stroke={p.ink}
          strokeWidth={1.8}
          strokeLinejoin="round"
        />
        <path
          d="M 18 85 C 26 80 36 77 44 76 M 78 85 C 70 80 60 77 52 76"
          fill="none"
          stroke={p.accent}
          strokeWidth={1.6}
          strokeLinecap="round"
          opacity={0.3}
        />
        <path
          d="M 30 80 C 32 86 33 91 32.5 96 M 66 80 C 64 86 63 91 63.5 96"
          fill="none"
          stroke={p.accent}
          strokeWidth={1.8}
          strokeLinecap="round"
          opacity={0.45}
        />
        <path
          d="M 24 84 C 26 88 26.5 92 26 96 M 72 84 C 70 88 69.5 92 70 96"
          fill="none"
          stroke={p.ink}
          strokeWidth={1.3}
          strokeLinecap="round"
          opacity={0.15}
        />
        <path
          d="M 56 84 L 65 84 L 64.4 91 L 56.6 91 Z"
          fill={p.light}
          stroke={p.ink}
          strokeWidth={1.4}
          strokeLinejoin="round"
        />
        <path
          d="M 58.5 84 L 58 78.5"
          fill="none"
          stroke={p.accent}
          strokeWidth={1.8}
          strokeLinecap="round"
        />
        <path
          d="M 57.4 78.4 L 58.6 78.4 L 58.5 79.6 L 57.5 79.6 Z"
          fill={p.light}
          stroke={p.ink}
          strokeWidth={0.6}
        />
        <path
          d="M 61.5 84 L 61.2 79.5"
          fill="none"
          stroke={p.ink}
          strokeWidth={1.8}
          strokeLinecap="round"
        />
        <path
          d="M 60.6 79.4 L 61.8 79.4 L 61.7 80.6 L 60.7 80.6 Z"
          fill={p.light}
          stroke={p.ink}
          strokeWidth={0.6}
        />
        <circle cx={48.6} cy={84} r={1.1} fill={p.accent} stroke={p.ink} strokeWidth={0.8} />
        <circle cx={48.3} cy={89} r={1.1} fill={p.accent} stroke={p.ink} strokeWidth={0.8} />
        <path
          d="M 8 93.5 C 30 91.5 66 91.5 88 93.5"
          fill="none"
          stroke={p.accent}
          strokeWidth={1}
          strokeDasharray="2 3"
          opacity={0.5}
        />
      </>
    ),
  },
  {
    id: "puffer",
    name: "Puffer Jacket",
    weight: 6,
    render: (p, uid) => (
      <>
        <defs>
          <linearGradient id={`cl-puffer-${uid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={p.light} />
            <stop offset="0.45" stopColor={p.accent} />
            <stop offset="1" stopColor={p.ink} />
          </linearGradient>
        </defs>
        <path
          d="M 48 71 C 34 71 19 75 12.5 81 C 7 85.5 5 91 4.5 96 L 91.5 96 C 91 91 89 85.5 83.5 81 C 77 75 62 71 48 71 Z"
          fill={p.ink}
          opacity={0.5}
        />
        <path
          d="M 38 72 C 42 68.5 54 68.5 58 72 C 58 75.5 54 78 48 78 C 42 78 38 75.5 38 72 Z"
          fill={`url(#cl-puffer-${uid})`}
          stroke={p.ink}
          strokeWidth={2}
          strokeLinejoin="round"
        />
        <path
          d="M 40 71 C 43 68.8 53 68.8 56 71"
          fill="none"
          stroke={p.light}
          strokeWidth={1.4}
          strokeLinecap="round"
          opacity={0.5}
        />
        <path
          d="M 13 80 C 17 76.5 30 74 48 74 C 66 74 79 76.5 83 80 C 83 84 66 86.5 48 86.5 C 30 86.5 13 84 13 80 Z"
          fill={`url(#cl-puffer-${uid})`}
          stroke={p.ink}
          strokeWidth={1.8}
          strokeLinejoin="round"
        />
        <path
          d="M 16 79 C 24 76.5 36 75.2 48 75.2 C 60 75.2 72 76.5 80 79"
          fill="none"
          stroke={p.light}
          strokeWidth={1.6}
          strokeLinecap="round"
          opacity={0.45}
        />
        <path
          d="M 8.5 86.5 C 20 83.5 36 82.5 48 82.5 C 60 82.5 76 83.5 87.5 86.5 C 87.5 90 68 92 48 92 C 28 92 8.5 90 8.5 86.5 Z"
          fill={`url(#cl-puffer-${uid})`}
          stroke={p.ink}
          strokeWidth={1.8}
          strokeLinejoin="round"
        />
        <path
          d="M 12 86 C 22 83.5 36 82.7 48 82.7 C 60 82.7 74 83.5 84 86"
          fill="none"
          stroke={p.light}
          strokeWidth={1.5}
          strokeLinecap="round"
          opacity={0.4}
        />
        <path
          d="M 6 92.5 C 20 90 36 89.5 48 89.5 C 60 89.5 76 90 90 92.5 C 90 94.5 72 96 48 96 C 24 96 6 94.5 6 92.5 Z"
          fill={`url(#cl-puffer-${uid})`}
          stroke={p.ink}
          strokeWidth={1.8}
          strokeLinejoin="round"
        />
        <path
          d="M 9 92 C 22 90.2 36 89.8 48 89.8 C 60 89.8 74 90.2 87 92"
          fill="none"
          stroke={p.light}
          strokeWidth={1.4}
          strokeLinecap="round"
          opacity={0.35}
        />
        <path
          d="M 48 73 L 48 96"
          fill="none"
          stroke={p.ink}
          strokeWidth={3.2}
        />
        <path
          d="M 48 74 L 48 95"
          fill="none"
          stroke={p.light}
          strokeWidth={1.6}
          strokeDasharray="1.4 1.8"
          opacity={0.85}
        />
        <rect
          x={46.7}
          y={80}
          width={2.6}
          height={4.6}
          rx={1.1}
          fill={p.ink}
          stroke={p.light}
          strokeWidth={0.9}
        />
        <path
          d="M 48 84.6 L 48 87.4"
          fill="none"
          stroke={p.light}
          strokeWidth={0.9}
        />
        <path
          d="M 16 88 C 18 91 18.5 93.5 18 96 M 80 88 C 78 91 77.5 93.5 78 96"
          fill="none"
          stroke={p.ink}
          strokeWidth={1.5}
          strokeLinecap="round"
          opacity={0.2}
        />
        <path
          d="M 18 78.5 C 26 75.5 36 74.2 44 74"
          fill="none"
          stroke={p.light}
          strokeWidth={1.6}
          strokeLinecap="round"
          opacity={0.4}
        />
      </>
    ),
  },
  {
    id: "wizard-cloak",
    name: "Wizard Cloak",
    weight: 3,
    render: (p, uid) => (
      <>
        <defs>
          <linearGradient id={`cl-cloak-${uid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={p.accent} />
            <stop offset="1" stopColor={p.ink} />
          </linearGradient>
          <linearGradient id={`cl-cloak-collar-${uid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={p.light} />
            <stop offset="0.5" stopColor={p.accent} />
            <stop offset="1" stopColor={p.ink} />
          </linearGradient>
        </defs>
        <path
          d="M 48 70 C 33 70 17 75 10 81 C 4 86 2.5 91.5 2 96 L 94 96 C 93.5 91.5 92 86 86 81 C 79 75 63 70 48 70 Z"
          fill={`url(#cl-cloak-${uid})`}
          stroke={p.ink}
          strokeWidth={2.5}
          strokeLinejoin="round"
        />
        <path
          d="M 30 77 C 28.5 84 27.5 90 27 96 M 66 77 C 67.5 84 68.5 90 69 96"
          fill="none"
          stroke={p.light}
          strokeWidth={1.4}
          strokeLinecap="round"
          opacity={0.25}
        />
        <path
          d="M 26 78 C 24 84 22 90 21 96 M 70 78 C 72 84 74 90 75 96"
          fill="none"
          stroke={p.ink}
          strokeWidth={2}
          strokeLinecap="round"
          opacity={0.28}
        />
        <path
          d="M 36 76 C 34.5 83 34 90 34.5 96 M 60 76 C 61.5 83 62 90 61.5 96"
          fill="none"
          stroke={p.ink}
          strokeWidth={1.5}
          strokeLinecap="round"
          opacity={0.18}
        />
        <path
          d="M 42 72 C 38 67 32 64 26 64 C 27.5 69 30 73.5 34 76.5 C 37 75 40 73.5 42 72 Z"
          fill={`url(#cl-cloak-collar-${uid})`}
          stroke={p.ink}
          strokeWidth={2}
          strokeLinejoin="round"
        />
        <path
          d="M 54 72 C 58 67 64 64 70 64 C 68.5 69 66 73.5 62 76.5 C 59 75 56 73.5 54 72 Z"
          fill={`url(#cl-cloak-collar-${uid})`}
          stroke={p.ink}
          strokeWidth={2}
          strokeLinejoin="round"
        />
        <path
          d="M 36.5 75.5 C 41 77 44.5 78 48 79 M 59.5 75.5 C 55 77 51.5 78 48 79"
          fill="none"
          stroke={p.light}
          strokeWidth={1.4}
          strokeLinecap="round"
          opacity={0.7}
        />
        <circle cx={48} cy={79} r={3.2} fill={`url(#cl-cloak-collar-${uid})`} stroke={p.ink} strokeWidth={1.6} />
        <circle cx={47} cy={77.9} r={0.9} fill={p.light} />
        <circle cx={43.5} cy={76} r={1.2} fill={p.accent} stroke={p.ink} strokeWidth={0.8} />
        <circle cx={52.5} cy={76} r={1.2} fill={p.accent} stroke={p.ink} strokeWidth={0.8} />
        <circle cx={43.5} cy={82} r={1.2} fill={p.accent} stroke={p.ink} strokeWidth={0.8} />
        <circle cx={52.5} cy={82} r={1.2} fill={p.accent} stroke={p.ink} strokeWidth={0.8} />
        <path
          d="M 24 86 Q 24.5 83.7 27 83 Q 24.5 82.3 24 80 Q 23.5 82.3 21 83 Q 23.5 83.7 24 86 Z"
          fill={p.light}
          opacity={0.9}
        />
        <path
          d="M 70 82 Q 70.4 80.2 72.3 79.6 Q 70.4 79 70 77.2 Q 69.6 79 67.7 79.6 Q 69.6 80.2 70 82 Z"
          fill={p.light}
          opacity={0.9}
        />
        <path
          d="M 33 90 Q 33.3 88.5 34.8 88.1 Q 33.3 87.7 33 86.2 Q 32.7 87.7 31.2 88.1 Q 32.7 88.5 33 90 Z"
          fill={p.light}
          opacity={0.85}
        />
        <path
          d="M 64 91 Q 64.3 89.5 65.8 89.1 Q 64.3 88.7 64 87.2 Q 63.7 88.7 62.2 89.1 Q 63.7 89.5 64 91 Z"
          fill={p.light}
          opacity={0.85}
        />
        <path
          d="M 3 93.5 C 30 96 66 96 93 93.5"
          fill="none"
          stroke={p.light}
          strokeWidth={1.6}
          strokeDasharray="3 3"
          opacity={0.45}
        />
      </>
    ),
  },
  {
    id: "pauldrons",
    name: "Armored Pauldrons",
    weight: 2,
    render: (p, uid) => (
      <>
        <defs>
          <linearGradient id={`cl-armor-${uid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={p.light} />
            <stop offset="0.45" stopColor={p.accent} />
            <stop offset="1" stopColor={p.ink} />
          </linearGradient>
        </defs>
        <path
          d="M 48 74 C 36 74 24 77.5 17 82 C 11.5 86 9 91 8.5 96 L 87.5 96 C 87 91 84.5 86 79 82 C 72 77.5 60 74 48 74 Z"
          fill={`url(#cl-armor-${uid})`}
          stroke={p.ink}
          strokeWidth={2}
          strokeLinejoin="round"
        />
        <path
          d="M 48 79 L 48 96 M 40 86 L 56 86"
          fill="none"
          stroke={p.ink}
          strokeWidth={1.3}
          opacity={0.35}
        />
        <circle cx={40} cy={86} r={1} fill={p.light} stroke={p.ink} strokeWidth={0.7} />
        <circle cx={56} cy={86} r={1} fill={p.light} stroke={p.ink} strokeWidth={0.7} />
        <circle cx={48} cy={83} r={1} fill={p.light} stroke={p.ink} strokeWidth={0.7} />
        <circle cx={48} cy={91} r={1} fill={p.light} stroke={p.ink} strokeWidth={0.7} />
        <path
          d="M 8 84 C 20 79.5 36 77.5 48 77.5 C 60 77.5 76 79.5 88 84"
          fill="none"
          stroke={p.light}
          strokeWidth={1.8}
          strokeLinecap="round"
          opacity={0.4}
        />
        <path
          d="M 2 96 C 0.5 87 4 79.5 12 76 C 21 72.8 30 75 33 81 C 34.5 85 33.5 90 31 94 C 26 96 12 96 2 96 Z"
          fill={`url(#cl-armor-${uid})`}
          stroke={p.ink}
          strokeWidth={2.2}
          strokeLinejoin="round"
        />
        <path
          d="M 5 90 C 12 86.5 22 84.5 32 85.5"
          fill="none"
          stroke={p.ink}
          strokeWidth={2.2}
          strokeLinecap="round"
          opacity={0.8}
        />
        <path
          d="M 4 93.5 C 13 90.5 23 89 31.5 90"
          fill="none"
          stroke={p.ink}
          strokeWidth={2}
          strokeLinecap="round"
          opacity={0.7}
        />
        <path
          d="M 8 83 C 14 79 22 77.5 28 79"
          fill="none"
          stroke={p.light}
          strokeWidth={2.4}
          strokeLinecap="round"
          opacity={0.8}
        />
        <circle cx={10} cy={80.5} r={1} fill={p.light} stroke={p.ink} strokeWidth={0.7} />
        <circle cx={20} cy={78} r={1} fill={p.light} stroke={p.ink} strokeWidth={0.7} />
        <circle cx={28} cy={79.5} r={1} fill={p.light} stroke={p.ink} strokeWidth={0.7} />
        <circle cx={8.5} cy={88.5} r={0.9} fill={p.light} stroke={p.ink} strokeWidth={0.6} />
        <path
          d="M 94 96 C 95.5 87 92 79.5 84 76 C 75 72.8 66 75 63 81 C 61.5 85 62.5 90 65 94 C 70 96 84 96 94 96 Z"
          fill={`url(#cl-armor-${uid})`}
          stroke={p.ink}
          strokeWidth={2.2}
          strokeLinejoin="round"
        />
        <path
          d="M 91 90 C 84 86.5 74 84.5 64 85.5"
          fill="none"
          stroke={p.ink}
          strokeWidth={2.2}
          strokeLinecap="round"
          opacity={0.8}
        />
        <path
          d="M 92 93.5 C 83 90.5 73 89 64.5 90"
          fill="none"
          stroke={p.ink}
          strokeWidth={2}
          strokeLinecap="round"
          opacity={0.7}
        />
        <path
          d="M 88 83 C 82 79 74 77.5 68 79"
          fill="none"
          stroke={p.light}
          strokeWidth={2.4}
          strokeLinecap="round"
          opacity={0.8}
        />
        <circle cx={86} cy={80.5} r={1} fill={p.light} stroke={p.ink} strokeWidth={0.7} />
        <circle cx={76} cy={78} r={1} fill={p.light} stroke={p.ink} strokeWidth={0.7} />
        <circle cx={68} cy={79.5} r={1} fill={p.light} stroke={p.ink} strokeWidth={0.7} />
        <circle cx={87.5} cy={88.5} r={0.9} fill={p.light} stroke={p.ink} strokeWidth={0.6} />
        <path
          d="M 42 74 L 48 76 L 54 74 L 54 78 L 48 80 L 42 78 Z"
          fill={`url(#cl-armor-${uid})`}
          stroke={p.ink}
          strokeWidth={1.8}
          strokeLinejoin="round"
        />
        <path
          d="M 44 75.5 L 48 76.9 L 52 75.5"
          fill="none"
          stroke={p.light}
          strokeWidth={1.2}
          strokeLinecap="round"
          opacity={0.8}
        />
      </>
    ),
  },
];
