export function AlienDripArt({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 96 96"
      className={className}
      aria-hidden
      focusable="false"
    >
      <defs>
        <radialGradient id="df-alien-drip-bg" cx="0.5" cy="0.3" r="0.9">
          <stop offset="0" stopColor="#331a66" />
          <stop offset="1" stopColor="#0b0420" />
        </radialGradient>
      </defs>
      <rect width="96" height="96" fill="url(#df-alien-drip-bg)" />
      <circle cx="48" cy="46" r="36" fill="#b6ff5c" opacity="0.07" />
      <path d="M16 96c2-10 11-17 32-17s30 7 32 17Z" fill="#3a1f6e" stroke="#05020c" strokeWidth="2.5" />
      <path d="M48 11c17 0 30 14 30 34 0 20-13 31-30 31S18 65 18 45c0-20 13-34 30-34Z" fill="#a7e95c" stroke="#05020c" strokeWidth="3" />
      <ellipse cx="48" cy="68" rx="20" ry="10" fill="#7fc23e" opacity="0.55" />
      <ellipse cx="39" cy="29" rx="10" ry="6.5" fill="#d3ffa0" opacity="0.5" />
      <path d="M20 40C20 20 32 11 48 11s28 9 28 29" fill="none" stroke="#8a5cff" strokeWidth="4" strokeLinecap="round" />
      <rect x="10" y="37" width="12" height="19" rx="5.5" fill="#6b3fe0" stroke="#05020c" strokeWidth="2.5" />
      <rect x="74" y="37" width="12" height="19" rx="5.5" fill="#6b3fe0" stroke="#05020c" strokeWidth="2.5" />
      <path d="M16 56c2 11 10 16 18 15" fill="none" stroke="#6b3fe0" strokeWidth="3" strokeLinecap="round" />
      <circle cx="35" cy="71" r="3.4" fill="#c9ff4d" stroke="#05020c" strokeWidth="2" />
      <ellipse cx="34" cy="44" rx="9.5" ry="12.5" fill="#0a0a16" stroke="#05020c" strokeWidth="2.5" transform="rotate(-10 34 44)" />
      <ellipse cx="62" cy="44" rx="9.5" ry="12.5" fill="#0a0a16" stroke="#05020c" strokeWidth="2.5" transform="rotate(10 62 44)" />
      <circle cx="31" cy="39" r="3.4" fill="#ffffff" />
      <circle cx="59" cy="39" r="3.4" fill="#ffffff" />
      <circle cx="37" cy="49" r="1.6" fill="#ffffff" opacity="0.7" />
      <circle cx="65" cy="49" r="1.6" fill="#ffffff" opacity="0.7" />
      <ellipse cx="45.5" cy="59.5" rx="1.3" ry="1.8" fill="#4d7a1f" />
      <ellipse cx="50.5" cy="59.5" rx="1.3" ry="1.8" fill="#4d7a1f" />
      <path d="M43 64c3 2.6 7 2.6 10 0" fill="none" stroke="#4d7a1f" strokeWidth="2.2" strokeLinecap="round" />
      <path d="M28 80c7 6 33 6 40 0" fill="none" stroke="#ffd24a" strokeWidth="2.4" strokeLinecap="round" />
      <circle cx="35" cy="83.5" r="2.4" fill="#ffd24a" stroke="#8a6410" strokeWidth="1.2" />
      <circle cx="48" cy="85" r="2.4" fill="#ffd24a" stroke="#8a6410" strokeWidth="1.2" />
      <circle cx="61" cy="83.5" r="2.4" fill="#ffd24a" stroke="#8a6410" strokeWidth="1.2" />
      <path d="M48 89l3 3-3 3-3-3Z" fill="#8ef0ff" stroke="#05020c" strokeWidth="1.4" strokeLinejoin="round" />
    </svg>
  );
}
