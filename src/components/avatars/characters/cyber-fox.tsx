export function CyberFoxArt({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 96 96"
      className={className}
      aria-hidden
      focusable="false"
    >
      <defs>
        <radialGradient id="df-cyber-fox-bg" cx="0.5" cy="0.3" r="0.9">
          <stop offset="0" stopColor="#102a4d" />
          <stop offset="1" stopColor="#070d1c" />
        </radialGradient>
        <linearGradient id="df-cyber-fox-visor" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#d8fbff" />
          <stop offset="0.5" stopColor="#41e3ff" />
          <stop offset="1" stopColor="#0d8fbf" />
        </linearGradient>
      </defs>
      <rect width="96" height="96" fill="url(#df-cyber-fox-bg)" />
      <circle cx="48" cy="50" r="34" fill="#41e3ff" opacity="0.07" />
      <path d="M25 43 14 9l29 17Z" fill="#ff8a2b" stroke="#0b0d18" strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M71 43l11-34-29 17Z" fill="#ff8a2b" stroke="#0b0d18" strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M28 38 21 17l17 10Z" fill="#ffd6b0" />
      <path d="M68 38l7-21-17 10Z" fill="#ffd6b0" />
      <path d="M48 19c18 0 31 13 31 32 0 19-14 31-31 31S17 70 17 51c0-19 13-32 31-32Z" fill="#ff8a2b" stroke="#0b0d18" strokeWidth="3" />
      <path d="M19 57l-9 5 9 6Z" fill="#ffb265" stroke="#0b0d18" strokeWidth="2" strokeLinejoin="round" />
      <path d="M77 57l9 5-9 6Z" fill="#ffb265" stroke="#0b0d18" strokeWidth="2" strokeLinejoin="round" />
      <path d="M48 57c10 0 16 4.5 16 10 0 7.5-7 14-16 14s-16-6.5-16-14c0-5.5 6-10 16-10Z" fill="#ffe9d2" stroke="#0b0d18" strokeWidth="2.2" />
      <rect x="15" y="40" width="66" height="22" rx="11" fill="#41e3ff" opacity="0.22" />
      <rect x="18" y="43" width="60" height="16" rx="8" fill="url(#df-cyber-fox-visor)" stroke="#0b0d18" strokeWidth="2.5" />
      <rect x="24" y="46" width="24" height="2.6" rx="1.3" fill="#ffffff" opacity="0.7" />
      <rect x="60" y="46" width="10" height="2.6" rx="1.3" fill="#ffffff" opacity="0.45" />
      <path d="M43.5 63h9L48 69Z" fill="#0b0d18" stroke="#0b0d18" strokeWidth="1.4" strokeLinejoin="round" />
      <path d="M48 69v3.5" stroke="#0b0d18" strokeWidth="2" strokeLinecap="round" />
      <path d="M42.5 75c3.5 2.8 7.5 2.8 11 0" fill="none" stroke="#0b0d18" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
