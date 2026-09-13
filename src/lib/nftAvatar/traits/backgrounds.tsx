import type { AvatarPalette, Trait } from "../types";

/** Deterministic star bed shared by the night-sky backdrops. */
const STAR_FIELD: Array<[number, number, number, number, boolean]> = [
  [8, 10, 0.7, 0.7, false],
  [18, 6, 0.9, 0.85, true],
  [31, 11, 0.6, 0.5, false],
  [44, 7, 0.8, 0.75, false],
  [58, 10, 0.6, 0.5, true],
  [70, 6, 0.9, 0.8, false],
  [84, 11, 0.7, 0.6, false],
  [91, 23, 0.6, 0.5, false],
  [5, 27, 0.8, 0.65, true],
  [89, 39, 0.7, 0.6, false],
  [4, 45, 0.6, 0.5, false],
  [91, 57, 0.8, 0.7, false],
  [5, 63, 0.7, 0.55, false],
  [88, 71, 0.6, 0.6, false],
  [7, 79, 0.8, 0.7, false],
  [18, 87, 0.6, 0.6, true],
  [31, 91, 0.7, 0.5, false],
  [47, 90, 0.6, 0.5, false],
  [61, 92, 0.8, 0.7, false],
  [73, 87, 0.6, 0.5, true],
  [85, 90, 0.9, 0.8, false],
  [92, 81, 0.6, 0.5, false],
  [13, 51, 0.5, 0.4, false],
  [83, 49, 0.5, 0.45, false],
];

/** Four-point sparkle used across the space backdrops. */
function sparkPath(x: number, y: number, s: number): string {
  const t = s * 0.3;
  return [
    `M${x} ${y - s}`,
    `L${x + t} ${y - t}`,
    `L${x + s} ${y}`,
    `L${x + t} ${y + t}`,
    `L${x} ${y + s}`,
    `L${x - t} ${y + t}`,
    `L${x - s} ${y}`,
    `L${x - t} ${y - t}`,
    "Z",
  ].join(" ");
}

/** Backgrounds: full-canvas layer, always drawn first. */
export const BACKGROUND_TRAITS: Trait[] = [
  {
    id: "sunburst",
    name: "Sunburst",
    weight: 12,
    render: (p, uid) => {
      const wedges = Array.from({ length: 12 }, (_, i) => {
        const a = ((i * 30 - 105) * Math.PI) / 180;
        const half = (13.5 * Math.PI) / 180;
        const r = 88;
        const x1 = 48 + Math.cos(a - half) * r;
        const y1 = 54 + Math.sin(a - half) * r;
        const x2 = 48 + Math.cos(a + half) * r;
        const y2 = 54 + Math.sin(a + half) * r;
        return (
          <path
            key={`wedge-${i}`}
            d={`M48 54 L${x1.toFixed(1)} ${y1.toFixed(1)} L${x2.toFixed(1)} ${y2.toFixed(1)} Z`}
            fill={p.accent}
            opacity={i % 2 === 0 ? 0.2 : 0.07}
          />
        );
      });
      const rays = Array.from({ length: 12 }, (_, i) => {
        const a = ((i * 30 - 90) * Math.PI) / 180;
        const x1 = 48 + Math.cos(a) * 10;
        const y1 = 54 + Math.sin(a) * 10;
        const x2 = 48 + Math.cos(a) * 90;
        const y2 = 54 + Math.sin(a) * 90;
        return (
          <path
            key={`ray-${i}`}
            d={`M${x1.toFixed(1)} ${y1.toFixed(1)} L${x2.toFixed(1)} ${y2.toFixed(1)}`}
            stroke={p.light}
            strokeWidth="1.3"
            opacity="0.12"
            strokeLinecap="round"
          />
        );
      });
      return (
        <>
          <defs>
            <linearGradient id={`bg-sunburst-base-${uid}`} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor={p.bg[0]} />
              <stop offset="100%" stopColor={p.bg[1]} />
            </linearGradient>
            <radialGradient id={`bg-sunburst-glow-${uid}`} cx="50%" cy="56%" r="66%">
              <stop offset="0%" stopColor={p.accent} stopOpacity="0.42" />
              <stop offset="55%" stopColor={p.accent} stopOpacity="0.09" />
              <stop offset="100%" stopColor={p.accent} stopOpacity="0" />
            </radialGradient>
            <radialGradient id={`bg-sunburst-vignette-${uid}`} cx="50%" cy="50%" r="72%">
              <stop offset="60%" stopColor={p.ink} stopOpacity="0" />
              <stop offset="100%" stopColor={p.ink} stopOpacity="0.6" />
            </radialGradient>
          </defs>
          <rect width="96" height="96" fill={`url(#bg-sunburst-base-${uid})`} />
          {wedges}
          {rays}
          <rect width="96" height="96" fill={`url(#bg-sunburst-glow-${uid})`} />
          <rect width="96" height="96" fill={`url(#bg-sunburst-vignette-${uid})`} />
        </>
      );
    },
  },
  {
    id: "starfield",
    name: "Starfield",
    weight: 12,
    render: (p, uid) => (
      <>
        <defs>
          <linearGradient id={`bg-starfield-sky-${uid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={p.bg[0]} />
            <stop offset="100%" stopColor={p.bg[1]} />
          </linearGradient>
          <radialGradient id={`bg-starfield-nebula-${uid}`} cx="24%" cy="30%" r="55%">
            <stop offset="0%" stopColor={p.accent} stopOpacity="0.16" />
            <stop offset="100%" stopColor={p.accent} stopOpacity="0" />
          </radialGradient>
          <radialGradient id={`bg-starfield-planet-${uid}`} cx="34%" cy="30%" r="80%">
            <stop offset="0%" stopColor={p.light} />
            <stop offset="45%" stopColor={p.accent} />
            <stop offset="100%" stopColor={p.bg[1]} />
          </radialGradient>
          <clipPath id={`bg-starfield-planet-clip-${uid}`}>
            <circle cx="79" cy="20" r="6.6" />
          </clipPath>
        </defs>
        <rect width="96" height="96" fill={`url(#bg-starfield-sky-${uid})`} />
        <rect width="96" height="96" fill={`url(#bg-starfield-nebula-${uid})`} />
        {STAR_FIELD.map(([x, y, r, o, hot], i) => (
          <circle
            key={`star-${i}`}
            cx={x}
            cy={y}
            r={r}
            fill={hot ? p.accent : p.light}
            opacity={o}
          />
        ))}
        <path d={sparkPath(13, 17, 3)} fill={p.light} opacity="0.7" />
        <path d={sparkPath(83, 32, 2.3)} fill={p.light} opacity="0.55" />
        <path d={sparkPath(19, 72, 2.1)} fill={p.light} opacity="0.5" />
        <path d={sparkPath(75, 83, 2.7)} fill={p.light} opacity="0.6" />
        <circle cx="79" cy="20" r="6.6" fill={`url(#bg-starfield-planet-${uid})`} />
        <g clipPath={`url(#bg-starfield-planet-clip-${uid})`}>
          <ellipse cx="83" cy="17.5" rx="6" ry="5.4" fill={p.bg[0]} opacity="0.55" />
        </g>
        <ellipse
          cx="79"
          cy="20"
          rx="10.6"
          ry="3.1"
          fill="none"
          stroke={p.light}
          strokeWidth="1.5"
          opacity="0.45"
          transform="rotate(-18 79 20)"
        />
      </>
    ),
  },
  {
    id: "halo-rings",
    name: "Halo Rings",
    weight: 11,
    render: (p, uid) => (
      <>
        <defs>
          <radialGradient id={`bg-halo-base-${uid}`} cx="50%" cy="50%" r="72%">
            <stop offset="0%" stopColor={p.bg[1]} />
            <stop offset="100%" stopColor={p.bg[0]} />
          </radialGradient>
          <radialGradient id={`bg-halo-core-${uid}`} cx="50%" cy="50%" r="42%">
            <stop offset="0%" stopColor={p.accent} stopOpacity="0.32" />
            <stop offset="100%" stopColor={p.accent} stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect width="96" height="96" fill={`url(#bg-halo-base-${uid})`} />
        <rect width="96" height="96" fill={`url(#bg-halo-core-${uid})`} />
        <circle cx="48" cy="50" r="18.5" fill="none" stroke={p.accent} strokeWidth="1.8" opacity="0.6" />
        <circle
          cx="48"
          cy="50"
          r="26"
          fill="none"
          stroke={p.accent}
          strokeWidth="1.2"
          strokeDasharray="4 3"
          opacity="0.4"
        />
        <circle cx="48" cy="50" r="34" fill="none" stroke={p.light} strokeWidth="1" opacity="0.18" />
        <circle cx="48" cy="50" r="43" fill="none" stroke={p.accent} strokeWidth="2" opacity="0.5" />
        {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => {
          const a = (deg * Math.PI) / 180;
          return (
            <circle
              key={`dot-${deg}`}
              cx={48 + Math.cos(a) * 26}
              cy={50 + Math.sin(a) * 26}
              r="1.2"
              fill={p.light}
              opacity="0.65"
            />
          );
        })}
        <path d="M6 6 H20 M90 6 H76 M6 90 H20 M90 90 H76" stroke={p.light} strokeWidth="1.4" opacity="0.28" strokeLinecap="round" />
      </>
    ),
  },
  {
    id: "neon-tide",
    name: "Neon Tide",
    weight: 10,
    render: (p, uid) => (
      <>
        <defs>
          <linearGradient id={`bg-tide-sky-${uid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={p.bg[0]} />
            <stop offset="68%" stopColor={p.bg[1]} />
            <stop offset="100%" stopColor={p.ink} />
          </linearGradient>
          <radialGradient id={`bg-tide-sun-${uid}`} cx="42%" cy="36%" r="70%">
            <stop offset="0%" stopColor={p.light} />
            <stop offset="55%" stopColor={p.accent} />
            <stop offset="100%" stopColor={p.accent} stopOpacity="0.75" />
          </radialGradient>
          <radialGradient id={`bg-tide-halo-${uid}`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={p.accent} stopOpacity="0.4" />
            <stop offset="100%" stopColor={p.accent} stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect width="96" height="96" fill={`url(#bg-tide-sky-${uid})`} />
        <circle cx="70" cy="27" r="15" fill={`url(#bg-tide-halo-${uid})`} />
        <circle cx="70" cy="27" r="9.6" fill={`url(#bg-tide-sun-${uid})`} />
        <circle cx="70" cy="27" r="12" fill="none" stroke={p.light} strokeWidth="1" opacity="0.28" />
        <ellipse cx="24" cy="25.5" rx="10" ry="3.4" fill={p.light} opacity="0.1" />
        <ellipse cx="30" cy="22.5" rx="6.5" ry="2.8" fill={p.light} opacity="0.1" />
        <path
          d="M0 62 Q12 55 24 62 T48 62 T72 62 T96 62 V96 H0 Z"
          fill={p.accent}
          opacity="0.22"
        />
        <path
          d="M0 62 Q12 55 24 62 T48 62 T72 62 T96 62"
          fill="none"
          stroke={p.light}
          strokeWidth="1.4"
          opacity="0.3"
        />
        {[12, 36, 60, 84].map((x) => (
          <circle key={`foam-${x}`} cx={x} cy={x === 12 || x === 60 ? 57.8 : 66.2} r="1.5" fill={p.light} opacity="0.45" />
        ))}
        <path
          d="M0 69 Q12 62 24 69 T48 69 T72 69 T96 69 V96 H0 Z"
          fill={p.bg[1]}
        />
        <path
          d="M0 69 Q12 62 24 69 T48 69 T72 69 T96 69"
          fill="none"
          stroke={p.accent}
          strokeWidth="1.2"
          opacity="0.4"
        />
        <path
          d="M0 78 Q12 71 24 78 T48 78 T72 78 T96 78 V96 H0 Z"
          fill={p.ink}
        />
      </>
    ),
  },
  {
    id: "vapor-sun",
    name: "Vapor Sun",
    weight: 10,
    render: (p, uid) => {
      const slats = [10.5, 13, 15.8, 18.8, 22, 25.5].map((y, i) => (
        <rect key={`slat-${i}`} x="32" y={y} width="32" height={1 + i * 0.5} fill={p.bg[0]} opacity="0.92" />
      ));
      return (
        <>
          <defs>
            <linearGradient id={`bg-vapor-sky-${uid}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={p.bg[0]} />
              <stop offset="100%" stopColor={p.bg[1]} />
            </linearGradient>
            <radialGradient id={`bg-vapor-sun-${uid}`} cx="42%" cy="34%" r="72%">
              <stop offset="0%" stopColor={p.light} />
              <stop offset="48%" stopColor={p.accent} />
              <stop offset="100%" stopColor={p.accent} stopOpacity="0.7" />
            </radialGradient>
            <radialGradient id={`bg-vapor-haze-${uid}`} cx="50%" cy="14%" r="50%">
              <stop offset="0%" stopColor={p.accent} stopOpacity="0.3" />
              <stop offset="100%" stopColor={p.accent} stopOpacity="0" />
            </radialGradient>
            <clipPath id={`bg-vapor-clip-${uid}`}>
              <circle cx="48" cy="15" r="15.5" />
            </clipPath>
          </defs>
          <rect width="96" height="96" fill={`url(#bg-vapor-sky-${uid})`} />
          <rect width="96" height="96" fill={`url(#bg-vapor-haze-${uid})`} />
          {STAR_FIELD.slice(0, 14).map(([x, y, r, o, hot], i) => (
            <circle key={`vstar-${i}`} cx={x} cy={y} r={r} fill={hot ? p.accent : p.light} opacity={o * 0.9} />
          ))}
          <circle cx="48" cy="15" r="15.5" fill={`url(#bg-vapor-sun-${uid})`} />
          <g clipPath={`url(#bg-vapor-clip-${uid})`}>{slats}</g>
          <circle cx="48" cy="15" r="15.5" fill="none" stroke={p.light} strokeWidth="1.2" opacity="0.3" />
          <rect x="0" y="57.4" width="96" height="0.9" fill={p.accent} opacity="0.45" />
          <ellipse cx="48" cy="58" rx="38" ry="8" fill={p.accent} opacity="0.12" />
          <path d="M0 96 H96" stroke={p.light} strokeWidth="1" opacity="0.15" />
        </>
      );
    },
  },
  {
    id: "glitch-grid",
    name: "Glitch Grid",
    weight: 7,
    render: (p, uid) => (
      <>
        <defs>
          <linearGradient id={`bg-glitch-sky-${uid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={p.bg[0]} />
            <stop offset="100%" stopColor={p.bg[1]} />
          </linearGradient>
          <radialGradient id={`bg-glitch-horizon-${uid}`} cx="50%" cy="57%" r="42%">
            <stop offset="0%" stopColor={p.accent} stopOpacity="0.34" />
            <stop offset="100%" stopColor={p.accent} stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect width="96" height="96" fill={`url(#bg-glitch-sky-${uid})`} />
        {Array.from({ length: 13 }, (_, i) => {
          const x = 48 + (i - 6) * 16;
          return (
            <path
              key={`gv-${i}`}
              d={`M48 57.5 L${x} 96`}
              stroke={p.accent}
              strokeWidth="1"
              opacity="0.16"
            />
          );
        })}
        {[60, 64, 69.5, 76.5, 85.5].map((y) => (
          <path key={`gh-${y}`} d={`M-6 ${y} H102`} stroke={p.accent} strokeWidth="1" opacity="0.22" />
        ))}
        <rect width="96" height="96" fill={`url(#bg-glitch-horizon-${uid})`} />
        {Array.from({ length: 16 }, (_, i) => (
          <rect key={`scan-${i}`} x="0" y={i * 6} width="96" height="2" fill={p.light} opacity="0.035" />
        ))}
        <rect x="-6" y="12" width="108" height="2.6" fill={p.accent} opacity="0.3" />
        <rect x="4" y="30" width="96" height="2" fill={p.light} opacity="0.18" />
        <rect x="-2" y="47" width="100" height="3" fill={p.accent} opacity="0.22" />
        <rect x="8" y="68" width="92" height="2.4" fill={p.light} opacity="0.14" />
        <rect x="0" y="84" width="104" height="3" fill={p.accent} opacity="0.18" />
        {[
          [16, 20],
          [78, 24],
          [24, 40],
          [70, 52],
          [38, 82],
          [58, 6],
          [88, 74],
          [10, 66],
        ].map(([x, y]) => (
          <rect key={`noise-${x}-${y}`} x={x} y={y} width="1.6" height="1.6" fill={p.light} opacity="0.22" />
        ))}
      </>
    ),
  },
  {
    id: "spotlight",
    name: "Stage Light",
    weight: 7,
    render: (p, uid) => (
      <>
        <defs>
          <radialGradient id={`bg-spot-base-${uid}`} cx="50%" cy="38%" r="72%">
            <stop offset="0%" stopColor={p.bg[1]} />
            <stop offset="100%" stopColor={p.bg[0]} />
          </radialGradient>
          <linearGradient id={`bg-spot-cone-${uid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={p.accent} stopOpacity="0.34" />
            <stop offset="100%" stopColor={p.accent} stopOpacity="0.02" />
          </linearGradient>
          <linearGradient id={`bg-spot-core-${uid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={p.light} stopOpacity="0.24" />
            <stop offset="100%" stopColor={p.light} stopOpacity="0" />
          </linearGradient>
          <radialGradient id={`bg-spot-vignette-${uid}`} cx="50%" cy="50%" r="70%">
            <stop offset="55%" stopColor={p.ink} stopOpacity="0" />
            <stop offset="100%" stopColor={p.ink} stopOpacity="0.62" />
          </radialGradient>
        </defs>
        <rect width="96" height="96" fill={`url(#bg-spot-base-${uid})`} />
        <path d="M48 -8 L94 96 L2 96 Z" fill={`url(#bg-spot-cone-${uid})`} />
        <path d="M48 -8 L75 96 L21 96 Z" fill={`url(#bg-spot-core-${uid})`} />
        <ellipse cx="48" cy="90" rx="33" ry="8.5" fill={p.accent} opacity="0.14" />
        <ellipse cx="48" cy="90" rx="33" ry="8.5" fill="none" stroke={p.accent} strokeWidth="1.3" opacity="0.4" />
        <ellipse cx="48" cy="90" rx="21" ry="5" fill="none" stroke={p.light} strokeWidth="1" opacity="0.22" />
        <rect x="38" y="-3.5" width="20" height="5" rx="2.5" fill={p.light} opacity="0.9" />
        <ellipse cx="48" cy="1" rx="17" ry="4.4" fill={p.light} opacity="0.3" />
        {[
          [40, 22],
          [55, 30],
          [44, 44],
          [60, 52],
          [37, 60],
          [53, 68],
          [46, 78],
          [63, 24],
          [35, 36],
        ].map(([x, y]) => (
          <circle key={`dust-${x}-${y}`} cx={x} cy={y} r="1.1" fill={p.light} opacity="0.3" />
        ))}
        <rect width="96" height="96" fill={`url(#bg-spot-vignette-${uid})`} />
      </>
    ),
  },
  {
    id: "retro-prism",
    name: "Retro Prism",
    weight: 6,
    render: (p, uid) => (
      <>
        <defs>
          <linearGradient id={`bg-prism-base-${uid}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={p.bg[0]} />
            <stop offset="100%" stopColor={p.bg[1]} />
          </linearGradient>
        </defs>
        <rect width="96" height="96" fill={`url(#bg-prism-base-${uid})`} />
        {[
          "M0 0 L22 0 L0 22 Z",
          "M96 0 L74 0 L96 22 Z",
          "M0 96 L22 96 L0 74 Z",
          "M96 96 L74 96 L96 74 Z",
        ].map((d) => (
          <path key={d} d={d} fill={p.bg[1]} opacity="0.9" stroke={p.accent} strokeWidth="1" strokeOpacity="0.4" />
        ))}
        <path d="M48 8 L88 48 L48 88 L8 48 Z" fill="none" stroke={p.accent} strokeWidth="2" opacity="0.9" />
        <path d="M48 20 L76 48 L48 76 L20 48 Z" fill={p.accent} fillOpacity="0.06" stroke={p.light} strokeWidth="1.2" opacity="0.45" />
        <path d="M48 32 L64 48 L48 64 L32 48 Z" fill="none" stroke={p.light} strokeWidth="1" opacity="0.25" />
        {[
          [48, 8, -1],
          [88, 48, 1],
          [48, 88, 1],
          [8, 48, -1],
        ].map(([x, y]) => (
          <path
            key={`gem-${x}-${y}`}
            d={`M${x} ${y - 4} L${x + 4} ${y} L${x} ${y + 4} L${x - 4} ${y} Z`}
            fill={p.accent}
            opacity="0.8"
            stroke={p.ink}
            strokeWidth="1.2"
          />
        ))}
        <path
          d="M0 84 L30 96 M96 12 L68 0"
          stroke={p.light}
          strokeWidth="2"
          opacity="0.18"
        />
        {[14, 82].map((x) =>
          [14, 82].map((y) => (
            <circle key={`px-${x}-${y}`} cx={x} cy={y} r="1.4" fill={p.light} opacity="0.3" />
          )),
        )}
      </>
    ),
  },
  {
    id: "circuit-board",
    name: "Circuit Board",
    weight: 5,
    render: (p, uid) => (
      <>
        <defs>
          <linearGradient id={`bg-circuit-base-${uid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={p.bg[0]} />
            <stop offset="100%" stopColor={p.bg[1]} />
          </linearGradient>
          <radialGradient id={`bg-circuit-glow-${uid}`} cx="82%" cy="16%" r="34%">
            <stop offset="0%" stopColor={p.accent} stopOpacity="0.2" />
            <stop offset="100%" stopColor={p.accent} stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect width="96" height="96" fill={`url(#bg-circuit-base-${uid})`} />
        {[
          "M12 24 H26 L34 32 H52",
          "M4 46 H20 L26 40 H38",
          "M58 16 V26 L66 34",
          "M84 40 V56 L74 66 H56",
          "M30 88 V78 L38 70 H52",
          "M88 62 H74 L68 68",
          "M8 62 H18 L24 56",
        ].map((d) => (
          <path key={d} d={d} fill="none" stroke={p.accent} strokeWidth="1.2" strokeOpacity="0.32" strokeLinejoin="round" strokeLinecap="round" />
        ))}
        {[
          [52, 32],
          [38, 40],
          [56, 66],
          [52, 70],
          [68, 68],
          [24, 56],
        ].map(([x, y]) => (
          <circle key={`node-${x}-${y}`} cx={x} cy={y} r="1.7" fill={p.accent} opacity="0.8" />
        ))}
        {[
          [12, 24],
          [4, 46],
          [84, 40],
          [30, 88],
          [8, 62],
        ].map(([x, y]) => (
          <circle key={`pad-${x}-${y}`} cx={x} cy={y} r="2.6" fill={p.bg[0]} stroke={p.light} strokeWidth="1" strokeOpacity="0.35" />
        ))}
        <rect x="66" y="9" width="22" height="15" rx="2" fill={p.bg[1]} stroke={p.accent} strokeWidth="1.2" strokeOpacity="0.55" />
        <rect x="69" y="12" width="16" height="9" rx="1" fill="none" stroke={p.light} strokeWidth="0.9" opacity="0.2" />
        <path d="M62 12.5 H66 M62 16.5 H66 M62 20.5 H66" stroke={p.accent} strokeWidth="1" opacity="0.45" />
        <rect x="6" y="70" width="16" height="12" rx="2" fill={p.bg[1]} stroke={p.accent} strokeWidth="1.1" strokeOpacity="0.45" />
        <path d="M22 73.5 H26 M22 77.5 H26" stroke={p.accent} strokeWidth="1" opacity="0.4" />
        <rect width="96" height="96" fill={`url(#bg-circuit-glow-${uid})`} />
      </>
    ),
  },
  {
    id: "aurora-dream",
    name: "Aurora Dream",
    weight: 2,
    render: (p, uid) => (
      <>
        <defs>
          <linearGradient id={`bg-aurora-sky-${uid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={p.bg[0]} />
            <stop offset="100%" stopColor={p.bg[1]} />
          </linearGradient>
          <linearGradient id={`bg-aurora-band-a-${uid}`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor={p.accent} stopOpacity="0" />
            <stop offset="30%" stopColor={p.accent} stopOpacity="0.55" />
            <stop offset="70%" stopColor={p.light} stopOpacity="0.4" />
            <stop offset="100%" stopColor={p.accent} stopOpacity="0" />
          </linearGradient>
          <linearGradient id={`bg-aurora-band-b-${uid}`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor={p.light} stopOpacity="0" />
            <stop offset="45%" stopColor={p.light} stopOpacity="0.35" />
            <stop offset="100%" stopColor={p.accent} stopOpacity="0" />
          </linearGradient>
        </defs>
        <rect width="96" height="96" fill={`url(#bg-aurora-sky-${uid})`} />
        {STAR_FIELD.slice(0, 18).map(([x, y, r, o, hot], i) => (
          <circle key={`astar-${i}`} cx={x} cy={y} r={r * 0.85} fill={hot ? p.accent : p.light} opacity={o * 0.8} />
        ))}
        <path
          d="M-8 50 C14 30 30 44 48 38 C66 32 80 20 104 34"
          fill="none"
          stroke={`url(#bg-aurora-band-a-${uid})`}
          strokeWidth="10"
          strokeLinecap="round"
          opacity="0.55"
        />
        <path
          d="M-8 38 C16 22 34 34 52 26 C68 19 82 12 104 22"
          fill="none"
          stroke={`url(#bg-aurora-band-b-${uid})`}
          strokeWidth="6"
          strokeLinecap="round"
          opacity="0.6"
        />
        <path
          d="M-8 61 C12 45 30 57 48 51 C64 46 80 35 104 47"
          fill="none"
          stroke={p.accent}
          strokeWidth="2.6"
          strokeLinecap="round"
          opacity="0.4"
        />
        <path d={sparkPath(24, 30, 2.4)} fill={p.light} opacity="0.5" />
        <path d={sparkPath(72, 44, 2)} fill={p.light} opacity="0.4" />
        <ellipse cx="48" cy="88" rx="30" ry="6" fill={p.accent} opacity="0.1" />
      </>
    ),
  },
];
