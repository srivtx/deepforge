export function SpaceBotArt({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 96 96"
      className={className}
      aria-hidden
      focusable="false"
    >
      <defs>
        <radialGradient id="df-space-bot-bg" cx="0.5" cy="0.3" r="0.9">
          <stop offset="0" stopColor="#0d2f57" />
          <stop offset="1" stopColor="#040a16" />
        </radialGradient>
      </defs>
      <rect width="96" height="96" fill="url(#df-space-bot-bg)" />
      <circle cx="48" cy="48" r="34" fill="#5ce1ff" opacity="0.08" />
      <path d="M48 24V13" stroke="#93a9c4" strokeWidth="3.2" strokeLinecap="round" />
      <circle cx="48" cy="9.5" r="5" fill="#5ce1ff" stroke="#040a14" strokeWidth="2" />
      <circle cx="46.4" cy="8" r="1.4" fill="#ffffff" />
      <path d="M20 96c1-9 8-15 16-15h24c8 0 15 6 16 15Z" fill="#5d7089" stroke="#040a14" strokeWidth="2.5" />
      <rect x="14" y="19" width="68" height="62" rx="16" fill="#b9cce0" stroke="#040a14" strokeWidth="3" />
      <path d="M14 60h68v5c0 8.8-7.2 16-16 16H30c-8.8 0-16-7.2-16-16Z" fill="#9fb2c8" />
      <rect x="21" y="32" width="54" height="40" rx="12" fill="#0e2138" stroke="#040a14" strokeWidth="2.5" />
      <circle cx="37" cy="47" r="6.5" fill="#5ce1ff" stroke="#040a14" strokeWidth="2" />
      <circle cx="59" cy="47" r="6.5" fill="#5ce1ff" stroke="#040a14" strokeWidth="2" />
      <circle cx="34.5" cy="44.5" r="1.9" fill="#ffffff" />
      <circle cx="56.5" cy="44.5" r="1.9" fill="#ffffff" />
      <rect x="35.8" y="58.5" width="3.4" height="7" rx="1.7" fill="#5ce1ff" />
      <rect x="42.8" y="58.5" width="3.4" height="7" rx="1.7" fill="#5ce1ff" />
      <rect x="49.8" y="58.5" width="3.4" height="7" rx="1.7" fill="#5ce1ff" />
      <rect x="56.8" y="58.5" width="3.4" height="7" rx="1.7" fill="#5ce1ff" />
      <rect x="40" y="25" width="16" height="3" rx="1.5" fill="#7f96ad" />
      <circle cx="14.5" cy="32" r="3" fill="#7f96ad" stroke="#040a14" strokeWidth="1.8" />
      <circle cx="81.5" cy="32" r="3" fill="#7f96ad" stroke="#040a14" strokeWidth="1.8" />
      <circle cx="14.5" cy="68" r="3" fill="#7f96ad" stroke="#040a14" strokeWidth="1.8" />
      <circle cx="81.5" cy="68" r="3" fill="#7f96ad" stroke="#040a14" strokeWidth="1.8" />
    </svg>
  );
}
