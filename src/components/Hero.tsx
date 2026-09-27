import Link from "next/link";
import { Aurora } from "@/components/motion/Aurora";
import { TodayEntry } from "@/components/today/TodayEntry";
import { StartEntry } from "@/components/onboarding/StartEntry";

interface HeroProps {
  problemCount: number;
  categoryCount: number;
}

export function Hero({ problemCount, categoryCount }: HeroProps) {
  return (
    <section className="relative isolate -mt-12 w-full overflow-hidden">
      <Aurora />
      <div className="relative mx-auto flex w-full max-w-6xl flex-col items-start gap-6 px-4 pt-32 pb-16 sm:px-6 sm:pt-40 sm:pb-24">
        <div className="flex items-center gap-2.5">
          <span className="df-pulse h-2 w-2 rounded-full bg-accent" />
          <span className="text-sm text-body-mid">
            {categoryCount} categories · real Python execution · local-first
          </span>
        </div>

        <h1 className="max-w-3xl text-4xl font-semibold leading-[1.08] tracking-tight text-ink sm:text-5xl md:text-6xl">
          Learn by building.
          <br />
          <span className="text-accent">Trust what you can test.</span>
        </h1>

        <p className="max-w-xl text-base text-body-mid sm:text-lg">
          DeepForge is a local-first ML practice platform and an experiment in
          reliable, evidence-based programming education. Solve{" "}
          {problemCount.toLocaleString()}+ problems with real in-browser Python
          execution — no sklearn, no torch, no shortcuts.
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <Link
            href="/problems"
            className="df-shimmer inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-canvas transition-opacity hover:opacity-90"
          >
            Start practicing
            <span aria-hidden>→</span>
          </Link>
          <StartEntry />
          <TodayEntry />
          <Link
            href="/paths"
            className="inline-flex items-center gap-2 rounded-lg border border-hairline px-4 py-2 text-sm font-medium text-ink transition-colors hover:border-accent/40 hover:bg-canvas-soft"
          >
            Browse paths
          </Link>
          <span className="text-xs text-body-mid">
            No account. Progress saves locally.
          </span>
        </div>
      </div>
    </section>
  );
}
