import { CountUp } from "@/components/motion/CountUp";

interface StatsStripProps {
  problemCount: number;
  categoryCount: number;
  pathCount: number;
}

interface Stat {
  label: string;
  count?: number;
  value?: string;
  suffix?: string;
}

export function StatsStrip({
  problemCount,
  categoryCount,
  pathCount,
}: StatsStripProps) {
  const stats: Stat[] = [
    { label: "problems", count: problemCount, suffix: "+" },
    { label: "categories", count: categoryCount },
    { label: "learning paths", count: pathCount },
    { label: "dependencies", value: "0" },
    { label: "executions", value: "∞" },
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
              {s.count !== undefined ? (
                <>
                  <CountUp value={s.count} />
                  {s.suffix}
                </>
              ) : (
                s.value
              )}
            </div>
            <div className="text-xs text-body-mid sm:text-sm">{s.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
