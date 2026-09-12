"use client";

import type { LearningPath, Problem } from "@/types/problem";

interface PathsProps {
  paths: LearningPath[];
  problems: Problem[];
  progress: Record<string, { solved?: boolean }>;
}

export function Paths({ paths, problems, progress }: PathsProps) {
  const problemMap = new Map(problems.map((p) => [p.id, p]));

  return (
    <section
      id="paths"
      className="mx-auto max-w-6xl scroll-mt-16 px-4 py-12 sm:px-6 sm:py-16"
    >
      <div className="mb-8">
        <h2 className="text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
          Learning paths
        </h2>
        <p className="mt-1 text-sm text-body-mid">
          Ordered sequences that take you from zero to a working ML primitive.
          Progress saves automatically.
        </p>
      </div>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {paths.map((path) => {
          const solvedInPath = path.problemIds.filter(
            (id) => progress[id]?.solved,
          ).length;
          const pct =
            path.problemIds.length === 0
              ? 0
              : Math.round((solvedInPath / path.problemIds.length) * 100);
          return (
            <div
              key={path.id}
              className="flex flex-col gap-3 rounded-lg border border-hairline bg-canvas-card p-5"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-base font-semibold text-ink">
                    {path.title}
                  </h3>
                  <p className="mt-1 text-xs text-body-mid">
                    {path.problemIds.length} problems · ~{path.estimatedHours}h
                  </p>
                </div>
                <span className="font-mono text-xs text-accent">
                  {solvedInPath}/{path.problemIds.length}
                </span>
              </div>
              <p className="text-sm leading-relaxed text-body">
                {path.description}
              </p>
              <div className="mt-1">
                <div className="h-1 w-full overflow-hidden rounded-full bg-canvas-mid">
                  <div
                    className="h-full bg-accent transition-all"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
              <div className="mt-1 flex flex-wrap gap-1">
                {path.problemIds.slice(0, 6).map((id) => {
                  const p = problemMap.get(id);
                  if (!p) return null;
                  const solved = progress[id]?.solved;
                  return (
                    <span
                      key={id}
                      title={p.title}
                      className={`rounded border px-1.5 py-0.5 font-mono text-[10px] ${
                        solved
                          ? "border-accent/40 bg-accent/5 text-accent"
                          : "border-hairline text-mute"
                      }`}
                    >
                      {p.id}
                    </span>
                  );
                })}
                {path.problemIds.length > 6 && (
                  <span className="rounded border border-hairline px-1.5 py-0.5 font-mono text-[10px] text-mute">
                    +{path.problemIds.length - 6} more
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
