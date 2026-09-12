interface StatsStripProps {
  problemCount: number;
  categoryCount: number;
  pathCount: number;
}

export function StatsStrip({
  problemCount,
  categoryCount,
  pathCount,
}: StatsStripProps) {
  const stats = [
    { value: `${problemCount.toLocaleString()}+`, label: "problems" },
    { value: `${categoryCount}`, label: "categories" },
    { value: `${pathCount}`, label: "learning paths" },
    { value: "0", label: "dependencies" },
    { value: "∞", label: "executions" },
  ];

  return (
    <section className="border-y border-hairline bg-canvas-card/40">
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-px px-4 sm:grid-cols-5 sm:px-6">
        {stats.map((s) => (
          <div
            key={s.label}
            className="flex flex-col gap-1 py-5 sm:items-center sm:text-center"
          >
            <div className="font-mono text-2xl font-medium text-accent sm:text-3xl">
              {s.value}
            </div>
            <div className="text-xs text-body-mid sm:text-sm">{s.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
