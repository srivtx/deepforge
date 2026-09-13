export function NeonApeArt({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 96 96"
      className={className}
      aria-hidden
      focusable="false"
    >
      <defs>
        <radialGradient id="df-neon-ape-bg" cx="0.5" cy="0.32" r="0.9">
          <stop offset="0" stopColor="#0f4a38" />
          <stop offset="1" stopColor="#04120d" />
        </radialGradient>
        <linearGradient id="df-neon-ape-visor" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#d9ffee" />
          <stop offset="0.45" stopColor="#5effb0" />
          <stop offset="1" stopColor="#12b981" />
        </linearGradient>
      </defs>
      <rect width="96" height="96" fill="url(#df-neon-ape-bg)" />
      <circle cx="48" cy="52" r="36" fill="#21e6a0" opacity="0.08" />
      <circle cx="16" cy="52" r="12.5" fill="#0f4a38" stroke="#02100b" strokeWidth="2.5" />
      <circle cx="80" cy="52" r="12.5" fill="#0f4a38" stroke="#02100b" strokeWidth="2.5" />
      <circle cx="16" cy="52" r="6" fill="#2fa87c" stroke="#02100b" strokeWidth="1.6" />
      <circle cx="80" cy="52" r="6" fill="#2fa87c" stroke="#02100b" strokeWidth="1.6" />
      <ellipse cx="48" cy="52" rx="31" ry="30" fill="#1d7d5c" stroke="#02100b" strokeWidth="3" />
      <path d="M48 33c10 0 19 8 19 20 0 13-9 23-19 23s-19-10-19-23c0-12 9-20 19-20Z" fill="#35b98a" />
      <path d="M19 40C19 22 31 13 48 13s29 9 29 27Z" fill="#0b2b22" stroke="#02100b" strokeWidth="3" strokeLinejoin="round" />
      <rect x="13" y="38" width="70" height="9" rx="4.5" fill="#123c30" stroke="#02100b" strokeWidth="2.5" />
      <rect x="19" y="40" width="58" height="3.4" rx="1.7" fill="#4dffa9" />
      <circle cx="48" cy="25" r="4" fill="#4dffa9" stroke="#02100b" strokeWidth="1.6" />
      <rect x="20" y="45" width="56" height="21" rx="10.5" fill="#3bffa8" opacity="0.25" />
      <rect x="23" y="47" width="50" height="17" rx="8.5" fill="url(#df-neon-ape-visor)" stroke="#02100b" strokeWidth="2.5" />
      <rect x="31" y="51.5" width="10.5" height="8" rx="4" fill="#03291e" />
      <rect x="54.5" y="51.5" width="10.5" height="8" rx="4" fill="#03291e" />
      <circle cx="34" cy="54.6" r="1.5" fill="#d9ffee" />
      <circle cx="57.5" cy="54.6" r="1.5" fill="#d9ffee" />
      <rect x="28" y="48.8" width="30" height="2.2" rx="1.1" fill="#ffffff" opacity="0.6" />
      <ellipse cx="48" cy="70" rx="12" ry="7" fill="#43cf9c" />
      <ellipse cx="43" cy="69" rx="1.6" ry="2.1" fill="#02100b" />
      <ellipse cx="53" cy="69" rx="1.6" ry="2.1" fill="#02100b" />
      <path d="M42 74.5c3.5 3 8.5 3 12 0" fill="none" stroke="#02100b" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  );
}
