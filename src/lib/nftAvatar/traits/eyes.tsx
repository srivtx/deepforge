import type { Trait } from "../types";

/** Eyes: centered (40, 46) and (56, 46). */
export const EYE_TRAITS: Trait[] = [
  {
    id: "anime-shine",
    name: "Anime Shine",
    weight: 13,
    render: (p, uid) => (
      <>
        {[40, 56].map((x, side) => (
          <g key={`anime-${side}`}>
            <defs>
              <radialGradient id={`ey-anime-iris-${side}-${uid}`} cx="50%" cy="30%" r="75%">
                <stop offset="0%" stopColor={p.light} />
                <stop offset="34%" stopColor={p.accent} />
                <stop offset="100%" stopColor={p.ink} />
              </radialGradient>
            </defs>
            <ellipse cx={x} cy={46.2} rx="4.6" ry="5.6" fill={p.light} stroke={p.ink} strokeWidth="2.2" />
            <circle cx={x} cy={46.9} r="3.3" fill={`url(#ey-anime-iris-${side}-${uid})`} />
            <ellipse cx={x} cy={46.9} rx="1.35" ry="1.8" fill={p.ink} />
            <circle cx={x - 1.5} cy={44.7} r="1.5" fill={p.light} />
            <circle cx={x + 1.5} cy={48.7} r="0.7" fill={p.light} opacity="0.75" />
            <path
              d={`M${x - 5.1} 43.6 Q${x} 39.4 ${x + 5.1} 43.6`}
              fill="none"
              stroke={p.ink}
              strokeWidth="2.6"
              strokeLinecap="round"
            />
            <path
              d={`M${x - 5} 37.6 Q${x} 36 ${x + 5} 37.6`}
              fill="none"
              stroke={p.ink}
              strokeWidth="2"
              strokeLinecap="round"
              opacity="0.85"
            />
          </g>
        ))}
      </>
    ),
  },
  {
    id: "sleepy-lids",
    name: "Heavy Lids",
    weight: 12,
    render: (p, uid) => (
      <>
        {[40, 56].map((x, side) => (
          <g key={`sleepy-${side}`}>
            <ellipse cx={x} cy={46.6} rx="4.4" ry="4.2" fill={p.light} stroke={p.ink} strokeWidth="2.2" />
            <ellipse cx={x} cy={48} rx="2.1" ry="1.5" fill={p.accent} stroke={p.ink} strokeWidth="1.5" />
            <circle cx={x - 0.6} cy={47.4} r="0.6" fill={p.light} />
            <path
              d={`M${x - 5} 45.6 Q${x} 41.6 ${x + 5} 45.6 L${x + 5.7} 40.8 L${x - 5.7} 40.8 Z`}
              fill={p.ink}
              opacity="0.92"
            />
            <path
              d={`M${x - 5} 45.6 Q${x} 41.6 ${x + 5} 45.6`}
              fill="none"
              stroke={p.ink}
              strokeWidth="2.4"
            />
            <path
              d={side === 0 ? `M${x - 5.2} 45 L${x - 6.8} 43.2` : `M${x + 5.2} 45 L${x + 6.8} 43.2`}
              stroke={p.ink}
              strokeWidth="1.7"
              strokeLinecap="round"
            />
            <path
              d={`M${x - 4.5} 37.8 Q${x} 36.6 ${x + 4.5} 37.8`}
              fill="none"
              stroke={p.ink}
              strokeWidth="2"
              strokeLinecap="round"
              opacity="0.8"
            />
          </g>
        ))}
      </>
    ),
  },
  {
    id: "pixel-vision",
    name: "Pixel Vision",
    weight: 12,
    render: (p, uid) => (
      <>
        {[40, 56].map((x, side) => (
          <g key={`pixel-${side}`}>
            <rect x={x - 4} y={42} width="8" height="8" fill={p.ink} />
            <rect x={x - 3} y={43} width="6" height="6" fill={p.light} />
            <rect x={x - 2} y={44.5} width="4" height="4" fill={p.accent} />
            <rect x={x - 1.5} y={45.5} width="2" height="2" fill={p.ink} />
            <rect x={x - 2.8} y={44.3} width="1.2" height="1.2" fill={p.light} />
          </g>
        ))}
      </>
    ),
  },
  {
    id: "odd-eyes",
    name: "Odd Eyes",
    weight: 11,
    render: (p, uid) => (
      <>
        {[40, 56].map((x, side) => (
          <g key={`odd-${side}`}>
            <ellipse cx={x} cy={46.2} rx="4.3" ry="5.3" fill={p.light} stroke={p.ink} strokeWidth="2.2" />
            <circle
              cx={x}
              cy={46.8}
              r="3"
              fill={side === 0 ? p.accent : p.bg[0]}
              stroke={side === 0 ? p.ink : p.accent}
              strokeWidth={side === 0 ? 0 : 1.6}
            />
            <circle cx={x} cy={46.8} r="1.3" fill={side === 0 ? p.ink : p.light} />
            <circle cx={x - 1.4} cy={44.9} r="1.2" fill={p.light} />
            <circle cx={x + 1.3} cy={48.3} r="0.6" fill={p.light} opacity="0.7" />
            <path
              d={`M${x - 4.8} 43.4 Q${x} 39.8 ${x + 4.8} 43.4`}
              fill="none"
              stroke={p.ink}
              strokeWidth="2.3"
              strokeLinecap="round"
            />
            <path
              d={`M${x - 4.5} 37.9 Q${x} 36.7 ${x + 4.5} 37.9`}
              fill="none"
              stroke={p.ink}
              strokeWidth="1.9"
              strokeLinecap="round"
              opacity="0.8"
            />
          </g>
        ))}
      </>
    ),
  },
  {
    id: "neon-visor",
    name: "Neon Visor",
    weight: 10,
    render: (p, uid) => (
      <>
        <defs>
          <linearGradient id={`ey-visor-glass-${uid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={p.accent} stopOpacity="0.9" />
            <stop offset="55%" stopColor={p.accent} stopOpacity="0.35" />
            <stop offset="100%" stopColor={p.bg[0]} stopOpacity="0.92" />
          </linearGradient>
        </defs>
        <rect x="26.5" y="41.5" width="43" height="9.5" rx="4.75" fill={p.ink} stroke={p.ink} strokeWidth="2.4" />
        <rect x="28.6" y="43" width="38.8" height="6.5" rx="3.25" fill={`url(#ey-visor-glass-${uid})`} />
        <circle cx="40" cy="46" r="4.5" fill={p.accent} opacity="0.25" />
        <circle cx="56" cy="46" r="4.5" fill={p.accent} opacity="0.25" />
        <circle cx="40" cy="46" r="2" fill={p.light} />
        <circle cx="56" cy="46" r="2" fill={p.light} />
        <path d="M30.5 44.2 L37 44.2 L33.5 46.1 L29 46.1 Z" fill={p.light} opacity="0.15" />
        <path d="M60 48.6 H66.5" stroke={p.light} strokeWidth="1.2" strokeLinecap="round" opacity="0.3" />
        <rect x="34.5" y="41.5" width="2.4" height="9.5" fill={p.ink} opacity="0.55" />
        <rect x="59.1" y="41.5" width="2.4" height="9.5" fill={p.ink} opacity="0.55" />
      </>
    ),
  },
  {
    id: "laser-gaze",
    name: "Laser Gaze",
    weight: 7,
    render: (p, uid) => (
      <>
        {[40, 56].map((x, side) => (
          <g key={`laser-${side}`}>
            <defs>
              <radialGradient id={`ey-laser-glow-${side}-${uid}`} cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor={p.accent} stopOpacity="0.55" />
                <stop offset="100%" stopColor={p.accent} stopOpacity="0" />
              </radialGradient>
            </defs>
            <circle cx={x} cy={46} r="7" fill={`url(#ey-laser-glow-${side}-${uid})`} />
            <ellipse cx={x} cy={46} rx="4.2" ry="1.9" fill={p.accent} stroke={p.ink} strokeWidth="1.8" />
            <ellipse cx={x} cy={46} rx="2.6" ry="1" fill={p.light} />
            <path
              d={side === 0 ? "M35 46 H29.5" : "M61 46 H66.5"}
              stroke={p.accent}
              strokeWidth="1.6"
              strokeLinecap="round"
              opacity="0.6"
            />
            <path
              d={side === 0 ? "M33 38.5 L44 41" : "M63 38.5 L52 41"}
              stroke={p.ink}
              strokeWidth="2.4"
              strokeLinecap="round"
            />
          </g>
        ))}
      </>
    ),
  },
  {
    id: "cyber-hud",
    name: "Cyber HUD",
    weight: 6,
    render: (p, uid) => (
      <>
        <defs>
          <linearGradient id={`ey-hud-screen-${uid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={p.bg[0]} stopOpacity="0.96" />
            <stop offset="100%" stopColor={p.ink} stopOpacity="0.96" />
          </linearGradient>
        </defs>
        <rect x="27" y="41.8" width="42" height="8.4" rx="4.2" fill={`url(#ey-hud-screen-${uid})`} stroke={p.ink} strokeWidth="2.2" />
        {[34, 38.5, 43, 47.5, 52, 56.5, 61].map((gx) => (
          <path key={`grid-${gx}`} d={`M${gx} 43 V49`} stroke={p.accent} strokeWidth="0.8" opacity="0.22" />
        ))}
        <circle cx="40" cy="46" r="3.1" fill="none" stroke={p.accent} strokeWidth="1.6" />
        <circle cx="56" cy="46" r="3.1" fill="none" stroke={p.accent} strokeWidth="1.6" />
        <circle cx="40" cy="46" r="1.2" fill={p.light} />
        <circle cx="56" cy="46" r="1.2" fill={p.light} />
        <path d="M29 45.9 H66.5" stroke={p.light} strokeWidth="0.8" opacity="0.3" />
        <path
          d="M29.4 43.3 h2.8 M63.8 43.3 h2.8 M29.4 48.7 h2.8 M63.8 48.7 h2.8"
          stroke={p.light}
          strokeWidth="1.3"
          strokeLinecap="round"
          opacity="0.55"
        />
      </>
    ),
  },
  {
    id: "spiral-stare",
    name: "Spiral Stare",
    weight: 3,
    render: (p, uid) => (
      <>
        {[40, 56].map((x, side) => {
          const steps = 30;
          const points = Array.from({ length: steps }, (_, i) => {
            const t = i / (steps - 1);
            const a = t * Math.PI * 3.4;
            const r = 0.5 + t * 4;
            return `${(x + Math.cos(a) * r).toFixed(2)} ${(46 + Math.sin(a) * r).toFixed(2)}`;
          });
          const spiral = `M${points[0]} L${points.slice(1).join(" L")}`;
          return (
            <g key={`spiral-${side}`}>
              <defs>
                <clipPath id={`ey-spiral-clip-${side}-${uid}`}>
                  <circle cx={x} cy={46} r="4.6" />
                </clipPath>
              </defs>
              <circle cx={x} cy={46} r="5" fill={p.light} stroke={p.ink} strokeWidth="2.2" />
              <g clipPath={`url(#ey-spiral-clip-${side}-${uid})`}>
                <path d={spiral} fill="none" stroke={p.ink} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </g>
              <circle cx={x + 0.4} cy={44.9} r="0.9" fill={p.accent} />
            </g>
          );
        })}
      </>
    ),
  },
  {
    id: "void-glow",
    name: "Void Glow",
    weight: 3,
    render: (p, uid) => (
      <>
        {[40, 56].map((x, side) => (
          <g key={`void-${side}`}>
            <defs>
              <radialGradient id={`ey-void-core-${side}-${uid}`} cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor={p.light} />
                <stop offset="42%" stopColor={p.accent} stopOpacity="0.85" />
                <stop offset="100%" stopColor={p.accent} stopOpacity="0" />
              </radialGradient>
            </defs>
            <circle cx={x} cy={46} r="7" fill={`url(#ey-void-core-${side}-${uid})`} opacity="0.5" />
            <ellipse cx={x} cy={46} rx="4.7" ry="5.7" fill={p.ink} />
            <ellipse cx={x} cy={46} rx="3.2" ry="4" fill={`url(#ey-void-core-${side}-${uid})`} />
            <circle cx={x} cy={46} r="1.5" fill={p.light} />
            <circle cx={x} cy={46} r="6.3" fill="none" stroke={p.accent} strokeWidth="1.1" opacity="0.4" />
          </g>
        ))}
      </>
    ),
  },
  {
    id: "starstruck",
    name: "Starstruck",
    weight: 2,
    render: (p, uid) => {
      const star = (x: number, y: number, s: number) => {
        const t = s * 0.32;
        return `M${x} ${y - s} L${x + t} ${y - t} L${x + s} ${y} L${x + t} ${y + t} L${x} ${y + s} L${x - t} ${y + t} L${x - s} ${y} L${x - t} ${y - t} Z`;
      };
      return (
        <>
          {[40, 56].map((x, side) => (
            <g key={`star-${side}`}>
              <ellipse cx={x} cy={46} rx="4.7" ry="5.7" fill={p.bg[0]} stroke={p.ink} strokeWidth="2.2" />
              <path d={star(x, 46.2, 4.6)} fill={p.accent} stroke={p.ink} strokeWidth="1.4" strokeLinejoin="round" />
              <circle cx={x} cy={46.2} r="1" fill={p.light} />
              <path
                d={
                  side === 0
                    ? `M${x - 7.6} 41.4 h3 M${x - 6.1} 39.9 v3`
                    : `M${x + 7.6} 41.4 h-3 M${x + 6.1} 39.9 v3`
                }
                stroke={p.light}
                strokeWidth="1"
                strokeLinecap="round"
                opacity="0.6"
              />
            </g>
          ))}
        </>
      );
    },
  },
];
