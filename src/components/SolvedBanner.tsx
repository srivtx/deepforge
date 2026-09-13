"use client";

import { cn } from "@/lib/utils";

export function FlameGlyph({ className }: { className?: string }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden
      className={className}
    >
      <path
        d="M8 1.5c1.7 2.9 4.5 4.7 4.5 8a4.5 4.5 0 1 1-9 0c0-1.5.7-2.9 1.7-4 .1 1 .7 1.8 1.5 2.2C6.2 5.6 6.9 3.5 8 1.5Z"
        fill="currentColor"
      />
    </svg>
  );
}

function CheckGlyph() {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden>
      <path
        d="M2 5l2 2 4-4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

interface SolvedBannerProps {
  /** "first" is the first all-pass run on this problem; "again" a re-solve. */
  kind: "first" | "again";
  /** Tests that passed in this run. */
  passed: number;
  /** Current progress streak in days; only shown on a first solve. */
  streak: number;
}

export function SolvedBanner({ kind, passed, streak }: SolvedBannerProps) {
  const first = kind === "first";
  const testLabel = `${passed} test${passed === 1 ? "" : "s"}`;
  const streakLabel = `${streak} day${streak === 1 ? "" : "s"}`;

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "flex items-start gap-3 rounded-lg border p-4 sm:p-5",
        first
          ? "df-slide-up df-solve-pulse border-accent/40 bg-accent/5"
          : "border-hairline bg-canvas",
      )}
    >
      <span
        aria-hidden
        className={cn(
          "mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full",
          first ? "bg-accent/15 text-accent" : "bg-canvas-soft text-body-mid",
        )}
      >
        <CheckGlyph />
      </span>
      {first ? (
        <div className="min-w-0">
          <div className="text-sm font-semibold text-accent">
            Problem complete
          </div>
          <div className="mt-0.5 text-xs text-body-mid">
            All {testLabel} passed
          </div>
          {streak > 0 && (
            <div className="mt-1.5 inline-flex items-center gap-1.5 font-mono text-[11px] text-accent">
              <FlameGlyph className="h-3.5 w-3.5 shrink-0" />
              Streak: {streakLabel}
            </div>
          )}
        </div>
      ) : (
        <div className="min-w-0 text-sm text-body">
          Solved — all tests passed
        </div>
      )}
    </div>
  );
}
