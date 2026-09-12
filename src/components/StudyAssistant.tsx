"use client";

import { useState } from "react";
import type { Problem } from "@/types/problem";
import { getHintTiers } from "@/lib/hints";
import { cn } from "@/lib/utils";

interface StudyAssistantProps {
  problem: Problem;
}

export function StudyAssistant({ problem }: StudyAssistantProps) {
  const [revealed, setRevealed] = useState(0);
  const tiers = getHintTiers(problem);
  const allRevealed = revealed >= tiers.length;

  return (
    <section className="mt-5" aria-label="Study assistant">
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setRevealed((n) => Math.min(n + 1, tiers.length))}
          disabled={allRevealed}
          aria-expanded={revealed > 0}
          aria-controls={`hint-tiers-${problem.id}`}
          className="rounded-lg border border-hairline bg-canvas-soft px-3 py-1.5 text-xs font-medium text-body transition-colors hover:border-accent/40 hover:text-ink focus:outline-none focus-visible:ring-1 focus-visible:ring-accent/40 disabled:cursor-default disabled:opacity-50"
        >
          {revealed === 0
            ? "Hint"
            : allRevealed
              ? "All hints shown"
              : "Next hint"}
        </button>
        {revealed > 0 && (
          <span className="font-mono text-[10px] text-mute">
            {revealed}/{tiers.length}
          </span>
        )}
      </div>

      <div
        id={`hint-tiers-${problem.id}`}
        aria-live="polite"
        aria-atomic="false"
        className="mt-2 space-y-2 empty:mt-0"
      >
        {revealed > 0 && (
          <div className="space-y-2">
            {tiers.slice(0, revealed).map((tier) => (
              <div
                key={tier.label}
                className="rounded-lg border border-hairline bg-canvas-soft p-3 text-sm"
              >
                <div
                  className={cn(
                    "mb-1.5 text-xs font-medium",
                    tier.isSolution ? "text-warning" : "text-body-mid",
                  )}
                >
                  {tier.label}
                </div>
                {tier.isSolution ? (
                  <pre className="df-scroll overflow-x-auto font-mono text-xs leading-relaxed text-body">
                    {tier.text}
                  </pre>
                ) : (
                  <p className="leading-relaxed text-body">{tier.text}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
