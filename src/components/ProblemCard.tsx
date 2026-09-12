"use client";

import type { Problem } from "@/types/problem";
import { cn, difficultyClasses } from "@/lib/utils";

interface ProblemCardProps {
  problem: Problem;
  solved?: boolean;
  attempted?: boolean;
  onClick: () => void;
}

export function ProblemCard({
  problem,
  solved,
  attempted,
  onClick,
}: ProblemCardProps) {
  return (
    <button
      onClick={onClick}
      className="group flex flex-col items-start gap-3 rounded-lg border border-hairline bg-canvas-card p-4 text-left transition-colors hover:border-accent/40 hover:bg-canvas-soft"
    >
      <div className="flex w-full items-center justify-between gap-2">
        <span className="font-mono text-[11px] text-mute">{problem.id}</span>
        <div className="flex items-center gap-2">
          {solved && (
            <span
              className="flex h-4 w-4 items-center justify-center rounded-full bg-accent/15 text-accent"
              aria-label="Solved"
            >
              <svg
                width="10"
                height="10"
                viewBox="0 0 10 10"
                fill="none"
                aria-hidden
              >
                <path
                  d="M2 5l2 2 4-4"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
          )}
          {!solved && attempted && (
            <span
              className="h-1.5 w-1.5 rounded-full bg-warning"
              aria-label="Attempted"
            />
          )}
          <span
            className={cn(
              "rounded-full border px-1.5 py-0.5 text-[10px] font-medium",
              difficultyClasses(problem.difficulty),
            )}
          >
            {problem.difficulty}
          </span>
        </div>
      </div>
      <div className="text-sm font-medium text-ink group-hover:text-accent">
        {problem.title}
      </div>
      <div className="text-xs text-body-mid">{problem.category}</div>
    </button>
  );
}
