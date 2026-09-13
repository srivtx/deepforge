export function AstroPenguinArt({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 96 96"
      className={className}
      aria-hidden
      focusable="false"
    >
      <defs>
        <radialGradient id="df-astro-penguin-bg" cx="0.5" cy="0.34" r="0.92">
          <stop offset="0" stopColor="#122a56" />
          <stop offset="1" stopColor="#050b19" />
        </radialGradient>
      </defs>
      <rect width="96" height="96" fill="url(#df-astro-penguin-bg)" />
      <circle cx="48" cy="52" r="36" fill="#62e6ff" opacity="0.08" />
      <circle cx="14" cy="22" r="1.2" fill="#cfeaff" />
      <circle cx="82" cy="30" r="1.4" fill="#cfeaff" />
      <circle cx="68" cy="12" r="1.1" fill="#cfeaff" />
      <circle cx="24" cy="78" r="1.2" fill="#cfeaff" />
      <circle cx="88" cy="66" r="1.1" fill="#cfeaff" />
      <circle cx="10" cy="36" r="1.1" fill="#cfeaff" />
      <path d="M78 72l1.2 3.6 3.6 1.2-3.6 1.2-1.2 3.6-1.2-3.6-3.6-1.2 3.6-1.2Z" fill="#9fe8ff" />
      <path d="M12 48l.9 2.7 2.7.9-2.7.9-.9 2.7-.9-2.7-2.7-.9 2.7-.9Z" fill="#9fe8ff" />
      <ellipse cx="19" cy="19" rx="14" ry="4.5" fill="none" stroke="#6fd4ef" strokeWidth="2" transform="rotate(-18 19 19)" />
      <circle cx="19" cy="19" r="8.5" fill="#24507e" stroke="#7fd8ff" strokeWidth="1.6" />
      <path d="M67 23.5 77 12" stroke="#c9d6e6" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="78.5" cy="10.5" r="6" fill="#62e6ff" opacity="0.28" />
      <circle cx="78.5" cy="10.5" r="3.2" fill="#62e6ff" stroke="#0a1220" strokeWidth="1.6" />
      <path d="M10 96q3-19 22-23h32q19 4 22 23Z" fill="#22304a" stroke="#0a1220" strokeWidth="2.5" strokeLinejoin="round" />
      <rect x="38" y="84" width="20" height="11" rx="3" fill="#2e405f" stroke="#0a1220" strokeWidth="1.6" />
      <circle cx="44" cy="89.5" r="2" fill="#62e6ff" />
      <circle cx="52" cy="89.5" r="2" fill="#62e6ff" />
      <ellipse cx="48" cy="79" rx="27" ry="8.5" fill="#2e405f" stroke="#0a1220" strokeWidth="2.5" />
      <circle cx="24" cy="79" r="1.7" fill="#8fa3bd" />
      <circle cx="72" cy="79" r="1.7" fill="#8fa3bd" />
      <circle cx="48" cy="54" r="25" fill="#141b26" stroke="#0a1220" strokeWidth="2.5" />
      <ellipse cx="40" cy="55" rx="12" ry="15" fill="#f4f8fb" />
      <ellipse cx="56" cy="55" rx="12" ry="15" fill="#f4f8fb" />
      <path d="M38 66h20l-10 13Z" fill="#f4f8fb" />
      <ellipse cx="40" cy="53" rx="3.4" ry="4.2" fill="#141b26" />
      <circle cx="39" cy="51.4" r="1.3" fill="#ffffff" />
      <ellipse cx="56" cy="53" rx="3.4" ry="4.2" fill="#141b26" />
      <circle cx="55" cy="51.4" r="1.3" fill="#ffffff" />
      <path d="M48 58 54.5 62.5 48 68.5 41.5 62.5Z" fill="#ffb454" stroke="#a85f1a" strokeWidth="2" strokeLinejoin="round" />
      <path d="M41.5 62.5h13" stroke="#a85f1a" strokeWidth="1.4" />
      <circle cx="48" cy="52" r="34" fill="#62e6ff" opacity="0.1" />
      <circle cx="48" cy="52" r="34" fill="none" stroke="#bfe9ff" strokeWidth="3" />
      <path d="M25 35A31 31 0 0 1 45 19.5" fill="none" stroke="#ffffff" strokeWidth="4" strokeLinecap="round" opacity="0.85" />
      <path d="M64 27q4.5 5 6 10.5" fill="none" stroke="#ffffff" strokeWidth="2.6" strokeLinecap="round" opacity="0.55" />
      <circle cx="68" cy="22" r="2" fill="#ffffff" opacity="0.5" />
    </svg>
  );
}
