"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { LABS } from "@/data/labs";
import { cn, difficultyClasses } from "@/lib/utils";
import { LAB_CHANGE_EVENT, getLabRecords, metricLabel, type LabRecords } from "@/lib/labs";
import { directionArrow, formatScore } from "@/components/labs/helpers";

export function Labs() {
  const [records, setRecords] = useState<LabRecords>({});

  useEffect(() => {
    const load = () => setRecords(getLabRecords());
    load();
    window.addEventListener(LAB_CHANGE_EVENT, load);
    return () => window.removeEventListener(LAB_CHANGE_EVENT, load);
  }, []);

  const completed = LABS.filter((lab) => records[lab.id]?.passed).length;

  return (
    <section
      id="labs"
      className="mx-auto max-w-6xl scroll-mt-16 px-4 py-10 sm:px-6 sm:py-14"
    >
      <div className="mb-6 flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-sm font-medium text-body-mid">
          {LABS.length} challenges · {completed}/{LABS.length} passed
        </h2>
        <Link
          href="/labs/trails"
          className="text-xs text-accent transition-opacity hover:opacity-80 focus:outline-none focus-visible:ring-1 focus-visible:ring-accent/40"
        >
          Lab trails →
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
        {LABS.map((lab) => {
          const record = records[lab.id];
          return (
            <Link
              key={lab.id}
              href={`/labs/${lab.id}`}
              className="group flex flex-col gap-3 rounded-lg border border-hairline bg-canvas-card p-4 text-left transition-colors hover:bg-canvas-soft focus-visible:outline focus-visible:outline-1 focus-visible:outline-accent sm:p-5"
            >
              <div className="flex w-full items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="text-base font-semibold text-ink group-hover:text-accent">
                    {lab.title}
                  </h3>
                  <p className="text-[11px] text-mute">{lab.category}</p>
                </div>
                <span
                  className={cn(
                    "shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-medium",
                    difficultyClasses(lab.difficulty),
                  )}
                >
                  {lab.difficulty}
                </span>
              </div>
              <p className="text-sm leading-relaxed text-body">{lab.blurb}</p>
              <div className="font-mono text-xs text-body-mid">
                {metricLabel(lab.metric)} {formatScore(lab, lab.baseline)} →{" "}
                {formatScore(lab, lab.target)} {directionArrow(lab)}
              </div>
              <div className="mt-auto flex w-full items-center justify-between gap-3 pt-1">
                <span className="font-mono text-xs text-body-mid">
                  {Math.round(lab.timeLimitSeconds / 60)} min · {lab.points} pts
                </span>
                <span
                  className={cn(
                    "shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-medium",
                    record?.passed
                      ? "border-accent/40 bg-accent/5 text-accent"
                      : "border-hairline text-body-mid",
                  )}
                >
                  {record?.passed
                    ? "Passed"
                    : record && record.best !== null
                      ? `Best ${formatScore(lab, record.best)}`
                      : "Open"}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
