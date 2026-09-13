import type { Trait } from "../types";

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
];
