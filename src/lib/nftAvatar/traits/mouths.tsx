import type { Trait } from "../types";

function sparkPath(cx: number, cy: number, s: number): string {
  const w = s * 0.18;
  const k = s * 0.72;
  return `M ${cx} ${cy - s} Q ${cx + w} ${cy - w} ${cx + k} ${cy} Q ${cx + w} ${cy + w} ${cx} ${cy + s} Q ${cx - w} ${cy + w} ${cx - k} ${cy} Q ${cx - w} ${cy - w} ${cx} ${cy - s} Z`;
}

/** Mouths: centered (48, 62). */
export const MOUTH_TRAITS: Trait[] = [
  {
    id: "big-grin",
    name: "Big Grin",
    weight: 13,
    render: (p) => (
      <>
        <path d="M36 60 Q48 73.5 60 60 Q48 64.8 36 60 Z" fill={p.ink} />
        <path d="M37.2 60.5 Q48 65.8 58.8 60.5 L57.8 63 Q48 67.8 38.2 63 Z" fill={p.light} />
        <path d="M44.2 62.8 V64.9 M51.8 62.8 V64.9" stroke={p.ink} strokeWidth="1" opacity="0.45" />
        <path d="M42 65.2 Q48 68.6 54 65.2 Q48 67 42 65.2 Z" fill={p.accent} opacity="0.6" />
        <path d="M36 60 Q48 73.5 60 60" fill="none" stroke={p.ink} strokeWidth="2.2" strokeLinecap="round" />
      </>
    ),
  },
  {
    id: "soft-smile",
    name: "Soft Smile",
    weight: 12,
    render: (p) => (
      <>
        <path d="M39.5 61 Q48 68 56.5 61" fill="none" stroke={p.ink} strokeWidth="3" strokeLinecap="round" />
        <path d="M42.5 63.4 Q48 67.4 53.5 63.4" fill="none" stroke={p.light} strokeWidth="1.3" strokeLinecap="round" opacity="0.35" />
        <circle cx="38.7" cy="60.4" r="0.9" fill={p.ink} opacity="0.7" />
        <circle cx="57.3" cy="60.4" r="0.9" fill={p.ink} opacity="0.7" />
      </>
    ),
  },
  {
    id: "cocky-smirk",
    name: "Cocky Smirk",
    weight: 12,
    render: (p) => (
      <>
        <path d="M39 63.6 Q47 68 57.6 59.6" fill="none" stroke={p.ink} strokeWidth="3" strokeLinecap="round" />
        <path d="M58.8 58.2 Q60.8 57.2 60 55.4" fill="none" stroke={p.ink} strokeWidth="1.7" strokeLinecap="round" opacity="0.7" />
        <path d="M43.5 64.6 Q48 66.2 51.5 64.8" fill="none" stroke={p.light} strokeWidth="1.2" strokeLinecap="round" opacity="0.3" />
      </>
    ),
  },
  {
    id: "cat-smile",
    name: "Cat Smile",
    weight: 10,
    render: (p) => (
      <>
        <path d="M48 57.4 V60.4" stroke={p.ink} strokeWidth="1.8" strokeLinecap="round" opacity="0.75" />
        <path d="M41 61 Q44.6 65.8 48 61" fill="none" stroke={p.ink} strokeWidth="2.7" strokeLinecap="round" />
        <path d="M48 61 Q51.4 65.8 55 61" fill="none" stroke={p.ink} strokeWidth="2.7" strokeLinecap="round" />
      </>
    ),
  },
  {
    id: "vamp-fangs",
    name: "Vamp Fangs",
    weight: 10,
    render: (p) => (
      <>
        <path
          d="M38.5 61.4 Q43.5 65.2 48 61.4 Q52.5 65.2 57.5 61.4"
          fill="none"
          stroke={p.ink}
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <path d="M41.8 61.7 L44.8 61.7 L43.3 67.2 Z" fill={p.light} stroke={p.ink} strokeWidth="1.5" strokeLinejoin="round" />
        <path d="M51.2 61.7 L54.2 61.7 L52.7 67.2 Z" fill={p.light} stroke={p.ink} strokeWidth="1.5" strokeLinejoin="round" />
      </>
    ),
  },
  {
    id: "bubblegum",
    name: "Bubblegum",
    weight: 7,
    render: (p, uid) => (
      <>
        <defs>
          <radialGradient id={`mo-gum-${uid}`} cx="38%" cy="32%" r="78%">
            <stop offset="0%" stopColor={p.light} />
            <stop offset="45%" stopColor={p.accent} />
            <stop offset="100%" stopColor={p.bg[1]} />
          </radialGradient>
        </defs>
        <path d="M40.5 62.5 Q43.8 64.8 46.4 63.2" fill="none" stroke={p.ink} strokeWidth="2" strokeLinecap="round" opacity="0.8" />
        <path d="M49.6 63.2 Q52.4 64.8 55.5 62.3" fill="none" stroke={p.ink} strokeWidth="2" strokeLinecap="round" opacity="0.8" />
        <circle cx="49.5" cy="61" r="6.4" fill={`url(#mo-gum-${uid})`} stroke={p.ink} strokeWidth="2.2" />
        <ellipse
          cx="46.7"
          cy="58.3"
          rx="2.3"
          ry="1.3"
          fill={p.light}
          opacity="0.85"
          transform="rotate(-28 46.7 58.3)"
        />
        <circle cx="52.3" cy="63.4" r="0.9" fill={p.light} opacity="0.6" />
      </>
    ),
  },
  {
    id: "tongue-out",
    name: "Tongue Out",
    weight: 6,
    render: (p) => (
      <>
        <path
          d="M44.6 63 Q43.9 69.6 47.6 70.9 Q51.6 69.9 51.3 63.3 Q48 64.8 44.6 63 Z"
          fill={p.accent}
          stroke={p.ink}
          strokeWidth="2"
          strokeLinejoin="round"
        />
        <path d="M47.7 65.2 V69.7" stroke={p.ink} strokeWidth="0.9" opacity="0.45" />
        <path d="M40 60.6 Q48 67.8 56 60.6 Q48 62.2 40 60.6 Z" fill={p.ink} stroke={p.ink} strokeWidth="1.8" strokeLinejoin="round" />
        <path d="M42 61.2 Q48 63.8 54 61.2 L53.4 62.5 Q48 64.7 42.6 62.5 Z" fill={p.light} />
      </>
    ),
  },
  {
    id: "banded-up",
    name: "Banded Up",
    weight: 5,
    render: (p, uid) => (
      <>
        <defs>
          <linearGradient id={`mo-mask-${uid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={p.bg[1]} />
            <stop offset="100%" stopColor={p.ink} />
          </linearGradient>
        </defs>
        <path
          d="M26 59 Q48 52.8 70 59 L70 65.5 Q70 72.5 62 73.6 L34 73.6 Q26 72.5 26 65.5 Z"
          fill={`url(#mo-mask-${uid})`}
          stroke={p.ink}
          strokeWidth="2.4"
          strokeLinejoin="round"
        />
        <path d="M27.2 58.6 Q48 52.6 68.8 58.6" fill="none" stroke={p.accent} strokeWidth="1.6" strokeLinecap="round" opacity="0.75" />
        <path d="M38 57.4 Q37 65.5 35.6 73.4" fill="none" stroke={p.light} strokeWidth="1.3" opacity="0.14" />
        <path d="M48 55.6 Q48 64.8 48 73.6" fill="none" stroke={p.light} strokeWidth="1.3" opacity="0.14" />
        <path d="M58 57.4 Q59 65.5 60.4 73.4" fill="none" stroke={p.light} strokeWidth="1.3" opacity="0.14" />
        <path
          d="M69.5 60.5 L76 57.5 L73.6 63.4 Z"
          fill={`url(#mo-mask-${uid})`}
          stroke={p.ink}
          strokeWidth="2"
          strokeLinejoin="round"
        />
        <path
          d="M69.5 63.4 L77 65 L72.6 67.6 Z"
          fill={`url(#mo-mask-${uid})`}
          stroke={p.ink}
          strokeWidth="2"
          strokeLinejoin="round"
        />
      </>
    ),
  },
  {
    id: "zip-up",
    name: "Zip Up",
    weight: 3,
    render: (p) => (
      <>
        <path d="M31.5 60.8 Q48 64 64.5 60.8" fill="none" stroke={p.ink} strokeWidth="2.2" />
        <path d="M31.5 65.2 Q48 68.4 64.5 65.2" fill="none" stroke={p.ink} strokeWidth="2.2" />
        {Array.from({ length: 9 }, (_, i) => {
          const t = (i + 0.5) / 9;
          const x = 31.5 + 33 * t;
          const lift = 6.4 * t * (1 - t);
          return (
            <path
              key={`zip-${i}`}
              d={`M${x.toFixed(1)} ${(60.8 + lift).toFixed(1)} V${(65.2 + lift).toFixed(1)}`}
              stroke={p.light}
              strokeWidth="1.3"
              opacity="0.5"
            />
          );
        })}
        <circle cx="30" cy="63" r="1.7" fill="none" stroke={p.light} strokeWidth="1.5" opacity="0.7" />
        <rect x="28.2" y="61" width="3" height="4" rx="1.2" fill={p.ink} stroke={p.light} strokeWidth="0.8" opacity="0.9" />
      </>
    ),
  },
  {
    id: "boss-mustache",
    name: "Boss Mustache",
    weight: 3,
    render: (p) => (
      <>
        <path d="M44 64.8 Q48 67.4 52 64.8" fill="none" stroke={p.ink} strokeWidth="2.3" strokeLinecap="round" opacity="0.9" />
        <path
          d="M48 60.6 C43.2 56 36 54.8 32.2 57.4 C29.2 59.4 30.3 62.9 33.3 62.7 C35.8 62.5 36.8 60.1 39.4 59.1 C42.4 57.9 45.4 59.2 48 60.6 C50.6 59.2 53.6 57.9 56.6 59.1 C59.2 60.1 60.2 62.5 62.7 62.7 C65.7 62.9 66.8 59.4 63.8 57.4 C60 54.8 52.8 56 48 60.6 Z"
          fill={p.ink}
          stroke={p.light}
          strokeOpacity="0.3"
          strokeWidth="1.2"
          strokeLinejoin="round"
        />
        <path
          d="M35.8 58.2 Q41.5 56.9 45.8 59.8"
          fill="none"
          stroke={p.light}
          strokeWidth="1.3"
          strokeLinecap="round"
          opacity="0.22"
        />
      </>
    ),
  },
  {
    id: "rainbow-tongue",
    name: "Rainbow Tongue",
    weight: 2,
    render: (p) => (
      <>
        <path
          d="M40.5 60.5 Q48 62.4 55.5 60.5 Q48 67.8 40.5 60.5 Z"
          fill={p.ink}
          stroke={p.ink}
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
        <path d="M42.6 61.2 Q48 63.4 53.4 61.2 L52.6 62.6 Q48 64.4 43.4 62.6 Z" fill={p.light} />
        <path
          d="M44.2 62.6 Q43.2 70.4 47.2 71.9 Q51.6 70.9 51.4 63.1 Q48 64.7 44.2 62.6 Z"
          fill={p.accent}
          stroke={p.ink}
          strokeWidth="2"
          strokeLinejoin="round"
        />
        <path d="M47.7 65.1 V71.1" stroke={p.ink} strokeWidth="0.9" opacity="0.45" />
        <path d="M46.2 68.6 Q44.9 69.9 46.4 71" fill="none" stroke="#ffffff" strokeWidth="0.8" opacity="0.35" strokeLinecap="round" />
        <path
          d="M48.1 72.2 C45.7 74.8 50.4 77 48.1 79.6 C46.5 81 47.1 81.9 49.4 82.6"
          fill="none"
          stroke={p.light}
          strokeWidth="19"
          strokeLinecap="round"
          opacity="0.13"
        />
        <path
          d="M48.1 72.2 C45.7 74.8 50.4 77 48.1 79.6 C46.5 81 47.1 81.9 49.4 82.6"
          fill="none"
          stroke={p.accent}
          strokeWidth="15"
          strokeLinecap="round"
          opacity="0.12"
        />
        {["#ff5a5a", "#ffb347", "#ffe066", "#6ee36e", "#41c7ff", "#b491ff"].map((color, i) => {
          const x = 41.8 + i * 2.48;
          return (
            <path
              key={`rainbow-band-${i}`}
              d={`M${x} 72.3 C${(x - 2.4).toFixed(2)} 74.9 ${(x + 2).toFixed(2)} 77 ${x} 79.5 C${(x - 1.6).toFixed(2)} 80.9 ${(x - 1).toFixed(2)} 81.8 ${(x + 0.3).toFixed(2)} 82.6`}
              fill="none"
              stroke={color}
              strokeWidth="2.3"
              strokeLinecap="round"
            />
          );
        })}
        <path d={sparkPath(53.2, 72.4, 2.4)} fill={p.light} />
        <path d={sparkPath(42.6, 75.2, 1.9)} fill="#ffffff" opacity="0.95" />
        <path d={sparkPath(51.6, 78.8, 2.1)} fill={p.light} opacity="0.9" />
        <path d={sparkPath(46.2, 81.8, 1.5)} fill="#ffffff" opacity="0.8" />
        <circle cx="55.4" cy="75.6" r="0.9" fill={p.light} opacity="0.9" />
        <circle cx="40.2" cy="79.4" r="0.8" fill={p.light} opacity="0.85" />
        <circle cx="49.8" cy="69.6" r="0.9" fill="#ffffff" opacity="0.9" />
      </>
    ),
  },
  {
    id: "gold-grillz",
    name: "Gold Grillz",
    weight: 3,
    render: (p, uid) => (
      <>
        <defs>
          <linearGradient id={`mo-gold-grill-${uid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#fff6c2" />
            <stop offset="0.45" stopColor="#ffd24a" />
            <stop offset="0.8" stopColor="#e0a020" />
            <stop offset="1" stopColor="#a8720f" />
          </linearGradient>
          <clipPath id={`mo-grill-clip-${uid}`}>
            <path d="M35.5 60.4 Q48 75.2 60.5 60.4 Q48 64.6 35.5 60.4 Z" />
          </clipPath>
        </defs>
        <path d="M34.5 60 Q48 74.4 61.5 60" fill="none" stroke={p.ink} strokeWidth="2.6" strokeLinecap="round" />
        <path d="M35.3 59.2 Q48 62.6 60.7 59.2" fill="none" stroke={p.light} strokeWidth="1.4" strokeLinecap="round" opacity="0.55" />
        <path d="M35.5 60.4 Q48 75.2 60.5 60.4 Q48 64.6 35.5 60.4 Z" fill={p.ink} />
        <g clipPath={`url(#mo-grill-clip-${uid})`}>
          <rect x={34.5} y={56.5} width={27} height={10.5} fill={`url(#mo-gold-grill-${uid})`} />
          <rect x={34.5} y={63} width={27} height={11} fill={`url(#mo-gold-grill-${uid})`} opacity={0.88} />
          {Array.from({ length: 8 }, (_, i) => (
            <path
              key={`tooth-${i}`}
              d={`M${35.4 + i * 3.5} 55.5 V75.5`}
              stroke="#8a5a0e"
              strokeWidth="0.75"
              opacity="0.75"
            />
          ))}
          <path d="M34.5 62.7 Q48 67.2 61.5 62.7" fill="none" stroke="#7a4c08" strokeWidth="1.1" opacity="0.85" />
          <path
            d="M36.5 59.5 Q42 62.6 41.5 66.5 M52.5 66.2 Q52.6 62 56.8 59.6"
            fill="none"
            stroke="#fffbe0"
            strokeWidth="1.3"
            opacity="0.75"
            strokeLinecap="round"
          />
          <path d="M37.5 61.6 V63.8 M46.5 62.4 V64.8 M55.5 62.2 V64.4" stroke="#fff8cc" strokeWidth="0.9" opacity="0.85" />
          <path d="M45.4 66.4 V68.4 M50 66.6 V68.8" stroke="#fff8cc" strokeWidth="0.8" opacity="0.6" />
        </g>
        <path d="M36.5 60.9 Q48 65.3 59.5 60.9" fill="none" stroke={p.ink} strokeWidth="0.9" opacity="0.55" />
        <path d={sparkPath(40.8, 63.2, 1.8)} fill="#ffffff" opacity="0.95" />
        <path d={sparkPath(56, 63.8, 1.6)} fill="#ffffff" opacity="0.9" />
        <circle cx="52.2" cy="64.4" r="0.7" fill="#ffffff" opacity="0.9" />
      </>
    ),
  },
  {
    id: "diamond-grillz",
    name: "Diamond Grillz",
    weight: 2,
    render: (p, uid) => (
      <>
        <defs>
          <linearGradient id={`mo-diamond-grill-${uid}`} x1="0" y1="0" x2="0.4" y2="1">
            <stop offset="0" stopColor="#ffffff" />
            <stop offset="0.45" stopColor="#dff7ff" />
            <stop offset="0.75" stopColor="#9fdcf5" />
            <stop offset="1" stopColor="#5aa8cf" />
          </linearGradient>
          <clipPath id={`mo-dgrill-clip-${uid}`}>
            <path d="M35.5 60.4 Q48 75.2 60.5 60.4 Q48 64.6 35.5 60.4 Z" />
          </clipPath>
        </defs>
        <path d="M34.5 60 Q48 74.4 61.5 60" fill="none" stroke={p.ink} strokeWidth="2.6" strokeLinecap="round" />
        <path d="M35.3 59.2 Q48 62.6 60.7 59.2" fill="none" stroke={p.light} strokeWidth="1.4" strokeLinecap="round" opacity="0.55" />
        <path d="M35.5 60.4 Q48 75.2 60.5 60.4 Q48 64.6 35.5 60.4 Z" fill="#0b2430" />
        <g clipPath={`url(#mo-dgrill-clip-${uid})`}>
          <path d="M34.5 62.8 Q48 67.4 61.5 62.8" fill="none" stroke="#03121b" strokeWidth="1.2" opacity="0.9" />
          {Array.from({ length: 6 }, (_, i) => {
            const cx = 38.4 + i * 3.85;
            const cy = 63.6;
            return (
              <g key={`gem-${i}`}>
                <path
                  d={`M${cx} ${cy - 3} L${(cx + 2.1).toFixed(2)} ${(cy - 0.6).toFixed(2)} L${cx} ${cy + 3.4} L${(cx - 2.1).toFixed(2)} ${(cy - 0.6).toFixed(2)} Z`}
                  fill={`url(#mo-diamond-grill-${uid})`}
                  stroke={p.ink}
                  strokeWidth="0.9"
                  strokeLinejoin="round"
                />
                <path d={`M${cx - 1.1} ${cy - 1} L${(cx - 0.2).toFixed(2)} ${(cy - 1.6).toFixed(2)}`} stroke="#ffffff" strokeWidth="0.8" opacity="0.95" strokeLinecap="round" />
              </g>
            );
          })}
          <path d="M36.5 59.5 Q42 62.6 41.5 66.5 M53.5 66 Q53.6 62 57.4 59.7" fill="none" stroke="#ffffff" strokeWidth="1.2" opacity="0.7" strokeLinecap="round" />
          <circle cx="44.2" cy="65.1" r="0.65" fill="#ffffff" opacity="0.95" />
          <circle cx="51.9" cy="64.9" r="0.65" fill="#ffffff" opacity="0.95" />
        </g>
        <path d="M36.5 60.9 Q48 65.3 59.5 60.9" fill="none" stroke={p.ink} strokeWidth="0.9" opacity="0.55" />
        <path d={sparkPath(42.5, 62.6, 1.9)} fill="#ffffff" />
        <path d={sparkPath(55.2, 63.4, 1.7)} fill="#ffffff" opacity="0.95" />
        <path d={sparkPath(61.5, 57.8, 1.3)} fill={p.accent} opacity="0.9" />
      </>
    ),
  },
  {
    id: "fire-breath",
    name: "Fire Breath",
    weight: 2,
    render: (p, uid) => (
      <>
        <defs>
          <linearGradient id={`mo-fire-${uid}`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#ff4d1f" />
            <stop offset="0.45" stopColor="#ff8a2f" />
            <stop offset="1" stopColor="#ffd24a" />
          </linearGradient>
          <radialGradient id={`mo-fire-glow-${uid}`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ffb347" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#ff5a1f" stopOpacity="0" />
          </radialGradient>
        </defs>
        <ellipse cx="57" cy="62" rx="13" ry="8" fill={`url(#mo-fire-glow-${uid})`} />
        <ellipse cx="44" cy="63" rx="3.8" ry="4.4" fill={p.ink} />
        <ellipse cx="44" cy="64.1" rx="2.1" ry="2.4" fill={p.accent} opacity="0.9" />
        <path
          d="M46.5 59.6 C52.5 55.6 61 54.6 67.5 56.8 C64.8 59.2 61 60.2 57.8 60.6 C60.8 62.2 63.6 64.2 65.8 66.8 C59.6 68.8 52.5 67.6 46.8 64.4 Z"
          fill={`url(#mo-fire-${uid})`}
          stroke={p.ink}
          strokeWidth="1.7"
          strokeLinejoin="round"
        />
        <path
          d="M48.4 61 C53.2 58.2 59.4 57.4 64 58.6 C61.8 60.2 59 60.9 56.6 61.1 C59 62.4 61.2 64 63 66 C58.2 67 53.4 66 49.6 63.9 Z"
          fill="#ffb347"
        />
        <path
          d="M50.4 61.6 C54 59.8 58.4 59.3 61.6 60.1 C59.8 61.2 57.8 61.6 56 61.8 C57.8 62.8 59.4 64 60.6 65.3 C57 65.8 53.6 65 51 63.6 Z"
          fill="#ffe066"
        />
        <circle cx="52.5" cy="61.8" r="1.5" fill="#fff6c9" opacity="0.95" />
        <circle cx="63.5" cy="57.8" r="1.1" fill="#ffd24a" opacity="0.9" />
        <circle cx="65.9" cy="65.6" r="1" fill="#ffb347" opacity="0.85" />
        <circle cx="60.9" cy="55.3" r="0.8" fill="#ffb347" opacity="0.8" />
        <path d="M40.4 60.6 Q38.6 63 40.6 65.4" fill="none" stroke={p.ink} strokeWidth="1.4" opacity="0.5" strokeLinecap="round" />
      </>
    ),
  },
];
