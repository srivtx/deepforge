"use client";

import { useSyncExternalStore } from "react";
import { useTheme } from "next-themes";

/**
 * Sun / moon toggle for the header. Renders a stable placeholder until the
 * client mounts (avoids the next-themes hydration mismatch), then swaps in
 * the icon that matches the active theme.
 */
export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  const isDark = resolvedTheme === "dark";

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className="flex h-8 w-8 items-center justify-center rounded-md border border-hairline text-body-mid transition-colors hover:bg-canvas-soft hover:text-ink focus:outline-none focus:ring-1 focus:ring-accent/30"
    >
      {mounted ? (
        isDark ? (
          // Sun icon — shown in dark mode, click to go light.
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
          </svg>
        ) : (
          // Moon icon — shown in light mode, click to go dark.
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
          </svg>
        )
      ) : (
        // Stable placeholder during SSR / first paint — same dimensions.
        <span className="block h-3.5 w-3.5" aria-hidden />
      )}
    </button>
  );
}
