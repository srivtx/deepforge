export function PandaPunkArt({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 96 96"
      className={className}
      aria-hidden
      focusable="false"
    >
      <defs>
        <radialGradient id="df-panda-punk-bg" cx="0.5" cy="0.34" r="0.92">
          <stop offset="0" stopColor="#3a2140" />
          <stop offset="1" stopColor="#130b17" />
        </radialGradient>
        <clipPath id="df-panda-punk-clip">
          <ellipse cx="48" cy="54" rx="32" ry="29" />
        </clipPath>
      </defs>
      <rect width="96" height="96" fill="url(#df-panda-punk-bg)" />
      <circle cx="48" cy="54" r="36" fill="#ff5fa2" opacity="0.08" />
      <path d="M15 14l1.5 4.5 4.5 1.5-4.5 1.5-1.5 4.5-1.5-4.5-4.5-1.5 4.5-1.5Z" fill="#ff5fa2" />
      <path d="M82 68l1.1 3.4 3.4 1.1-3.4 1.1-1.1 3.4-1.1-3.4-3.4-1.1 3.4-1.1Z" fill="#ff8ec2" />
      <circle cx="84" cy="30" r="1.5" fill="#ffa8cc" />
      <circle cx="12" cy="64" r="1.3" fill="#ffa8cc" />
      <path d="M32 31 29 15l8 9 2-17 7 14 2-17 6 17 5-13 3 15 6-9-1 17Z" fill="#ff5fa2" stroke="#16091a" strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M48 4l6 17 5-13 3 15 6-9-1 17H48Z" fill="#d94488" />
      <circle cx="22" cy="26" r="10.5" fill="#1b1b20" stroke="#16091a" strokeWidth="2.5" />
      <circle cx="74" cy="26" r="10.5" fill="#1b1b20" stroke="#16091a" strokeWidth="2.5" />
      <circle cx="22" cy="26" r="5" fill="#c93b78" />
      <circle cx="74" cy="26" r="5" fill="#c93b78" />
      <ellipse cx="48" cy="54" rx="32" ry="29" fill="#f7f5ef" stroke="#16091a" strokeWidth="2.5" />
      <g clipPath="url(#df-panda-punk-clip)">
        <ellipse cx="66" cy="68" rx="24" ry="30" fill="#e0dbcd" />
      </g>
      <ellipse cx="33" cy="52" rx="11.5" ry="13.5" fill="#1b1b20" transform="rotate(-14 33 52)" />
      <ellipse cx="63" cy="52" rx="11.5" ry="13.5" fill="#1b1b20" transform="rotate(14 63 52)" />
      <circle cx="33" cy="51" r="5.2" fill="#ffffff" />
      <circle cx="33" cy="51" r="3.2" fill="#ff5fa2" />
      <circle cx="33" cy="51" r="1.5" fill="#0d0d10" />
      <circle cx="31.5" cy="49.2" r="1.2" fill="#ffffff" />
      <circle cx="63" cy="51" r="5.2" fill="#ffffff" />
      <circle cx="63" cy="51" r="3.2" fill="#ff5fa2" />
      <circle cx="63" cy="51" r="1.5" fill="#0d0d10" />
      <circle cx="61.5" cy="49.2" r="1.2" fill="#ffffff" />
      <path d="M44 60.5q4-2 8 0-1 5-4 6-3-1-4-6Z" fill="#1b1b20" />
      <path d="M47.5 33 43 41.5h3.6L44.6 48 51 38.5h-3.8Z" fill="#ff5fa2" stroke="#16091a" strokeWidth="1.3" strokeLinejoin="round" />
      <path d="M38 70q11 8 21-2" fill="none" stroke="#16091a" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M53.5 71.3 57.5 70.3 56.6 74.6Z" fill="#ffffff" stroke="#16091a" strokeWidth="1.2" strokeLinejoin="round" />
      <circle cx="24" cy="63" r="4.2" fill="#ffa8cc" opacity="0.85" />
      <circle cx="72" cy="63" r="4.2" fill="#ffa8cc" opacity="0.85" />
      <circle cx="79.5" cy="39" r="6" fill="none" stroke="#f5c451" strokeWidth="3" />
      <circle cx="79.5" cy="45.6" r="2.2" fill="#ff5fa2" stroke="#16091a" strokeWidth="1" />
    </svg>
  );
}
