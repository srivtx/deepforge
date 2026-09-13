"use client";

import { useSyncExternalStore } from "react";
import { useTheme } from "next-themes";

/**
 * Minimal theme control for the page footer (x.ai placement). A single ghost
 * icon — sun in dark mode, moon in light mode — that crossfades with a gentle
 * rotation. Renders a stable placeholder until the client mounts so the
 * server and first client render match.
 */
export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  const isDark = resolvedTheme === "dark";
  const label = mounted
    ? isDark
      ? "Switch to light mode"
      : "Switch to dark mode"
    : "Toggle theme";

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={label}
      title={label}
      className="group relative flex h-8 w-8 items-center justify-center rounded-md text-body-mid transition-colors hover:bg-canvas-soft hover:text-ink focus:outline-none focus-visible:ring-1 focus-visible:ring-accent/40"
    >
      <span className="relative block h-4 w-4" aria-hidden>
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`absolute inset-0 h-4 w-4 transition-all duration-200 motion-reduce:transition-none ${
            mounted && isDark
              ? "rotate-0 scale-100 opacity-100"
              : "-rotate-90 scale-75 opacity-0"
          }`}
        >
          <circle cx="12" cy="12" r="4.5" />
          <path d="M12 2.5v2M12 19.5v2M4.34 4.34l1.42 1.42M18.24 18.24l1.42 1.42M2.5 12h2M19.5 12h2M4.34 19.66l1.42-1.42M18.24 5.76l1.42-1.42" />
        </svg>
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`absolute inset-0 h-4 w-4 transition-all duration-200 motion-reduce:transition-none ${
            mounted && !isDark
              ? "rotate-0 scale-100 opacity-100"
              : "rotate-90 scale-75 opacity-0"
          }`}
        >
          <path d="M20.5 14.2A8.6 8.6 0 1 1 9.8 3.5a7 7 0 0 0 10.7 10.7z" />
        </svg>
      </span>
    </button>
  );
}
