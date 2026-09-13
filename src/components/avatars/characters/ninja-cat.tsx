export function NinjaCatArt({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 96 96"
      className={className}
      aria-hidden
      focusable="false"
    >
      <defs>
        <radialGradient id="df-ninja-cat-bg" cx="0.5" cy="0.35" r="0.9">
          <stop offset="0" stopColor="#341a5e" />
          <stop offset="1" stopColor="#0c0520" />
        </radialGradient>
      </defs>
      <rect width="96" height="96" fill="url(#df-ninja-cat-bg)" />
      <circle cx="48" cy="54" r="35" fill="#8b5cf6" opacity="0.13" />
      <path d="M25 37 17 8l26 15Z" fill="#171226" stroke="#05030a" strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M71 37l8-29-26 15Z" fill="#171226" stroke="#05030a" strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M28 33 23 16l15 9Z" fill="#e63950" />
      <path d="M68 33l5-17-15 9Z" fill="#e63950" />
      <circle cx="48" cy="53" r="29" fill="#171226" stroke="#05030a" strokeWidth="3" />
      <path d="M68 32a29 29 0 0 1 7 17" fill="none" stroke="#4d3a7a" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M21 58h54c-6 14-16 22-27 22s-21-8-27-22Z" fill="#0d0a18" stroke="#05030a" strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M22 58h52" stroke="#ff3b52" strokeWidth="2.2" strokeLinecap="round" />
      <rect x="17" y="35" width="62" height="11" rx="5.5" fill="#ff3b52" stroke="#05030a" strokeWidth="2.5" />
      <path d="M48 40.5l2.8 3-2.8 3-2.8-3Z" fill="#e9e4ff" stroke="#05030a" strokeWidth="1.2" strokeLinejoin="round" />
      <circle cx="80" cy="43" r="4.5" fill="#ff3b52" stroke="#05030a" strokeWidth="2" />
      <path d="M80 47c3 7 1 12 5 18" fill="none" stroke="#ff3b52" strokeWidth="3.5" strokeLinecap="round" />
      <path d="M77 47c-1 6-5 10-4 15" fill="none" stroke="#c81f36" strokeWidth="3" strokeLinecap="round" />
      <path d="M32 53c4.5-5.5 11-5.5 15 0-4.5 5.5-11 5.5-15 0Z" fill="#f5f2ff" stroke="#05030a" strokeWidth="2" />
      <path d="M49 53c4.5-5.5 11-5.5 15 0-4.5 5.5-11 5.5-15 0Z" fill="#f5f2ff" stroke="#05030a" strokeWidth="2" />
      <circle cx="39.5" cy="53" r="2.6" fill="#d21f3c" />
      <circle cx="56.5" cy="53" r="2.6" fill="#d21f3c" />
      <circle cx="38.5" cy="52" r="1" fill="#ffffff" />
      <circle cx="55.5" cy="52" r="1" fill="#ffffff" />
    </svg>
  );
}
