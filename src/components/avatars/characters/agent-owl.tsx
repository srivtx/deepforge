export function AgentOwlArt({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 96 96"
      className={className}
      aria-hidden
      focusable="false"
    >
      <defs>
        <radialGradient id="df-agent-owl-bg" cx="0.5" cy="0.3" r="0.9">
          <stop offset="0" stopColor="#262968" />
          <stop offset="1" stopColor="#090a1e" />
        </radialGradient>
      </defs>
      <rect width="96" height="96" fill="url(#df-agent-owl-bg)" />
      <circle cx="48" cy="46" r="35" fill="#ffb03a" opacity="0.07" />
      <path d="M29 30 24 7l19 13Z" fill="#c47a2e" stroke="#0a0812" strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M67 30l5-23-19 13Z" fill="#c47a2e" stroke="#0a0812" strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M12 96c2-12 10-18 18-20l18 12 18-12c8 2 16 8 18 20Z" fill="#20224d" stroke="#0a0812" strokeWidth="2.5" />
      <path d="M30 76 48 88l-8 6-16-12Z" fill="#e9edff" stroke="#0a0812" strokeWidth="2" strokeLinejoin="round" />
      <path d="M66 76 48 88l8 6 16-12Z" fill="#e9edff" stroke="#0a0812" strokeWidth="2" strokeLinejoin="round" />
      <path d="M48 88l5 4-5 4-5-4Z" fill="#e0902f" stroke="#0a0812" strokeWidth="1.8" strokeLinejoin="round" />
      <ellipse cx="48" cy="46" rx="30" ry="29" fill="#d98f3a" stroke="#0a0812" strokeWidth="3" />
      <circle cx="38" cy="45" r="13.5" fill="#f4c88c" stroke="#0a0812" strokeWidth="2" />
      <circle cx="58" cy="45" r="13.5" fill="#f4c88c" stroke="#0a0812" strokeWidth="2" />
      <rect x="21" y="36" width="25.5" height="15" rx="7.5" fill="#0d0d18" stroke="#0a0812" strokeWidth="2.5" />
      <rect x="49.5" y="36" width="25.5" height="15" rx="7.5" fill="#0d0d18" stroke="#0a0812" strokeWidth="2.5" />
      <rect x="44" y="41" width="8" height="3.2" rx="1.6" fill="#0d0d18" />
      <path d="M26 47.5l7-7" stroke="#ffffff" strokeWidth="2.2" strokeLinecap="round" opacity="0.85" />
      <path d="M54 47.5l7-7" stroke="#41e3ff" strokeWidth="2.2" strokeLinecap="round" opacity="0.9" />
      <path d="M43.5 51h9l-4.5 13Z" fill="#ffb03a" stroke="#0a0812" strokeWidth="2" strokeLinejoin="round" />
      <path d="M48 64v4" stroke="#0a0812" strokeWidth="2" strokeLinecap="round" />
      <circle cx="77" cy="55" r="4" fill="#20224d" stroke="#0a0812" strokeWidth="2" />
      <path d="M77 59c-2 4-5 7-9 8" fill="none" stroke="#20224d" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}
