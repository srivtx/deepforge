"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { LABS, type Lab } from "@/data/labs";
import { LAB_TRAILS } from "@/data/labTrails";
import { LAB_CHANGE_EVENT, getLabRecords, type LabRecords } from "@/lib/labs";
import { cn } from "@/lib/utils";

const LAB_BY_ID = new Map(LABS.map((lab) => [lab.id, lab]));

function formatScore(lab: Lab, value: number): string {
  return lab.metric === "mse" ? value.toFixed(2) : value.toFixed(3);
}

function statusChip(lab: Lab, record: LabRecords[string] | undefined) {
  if (record?.passed) {
    return {
      label: "Passed",
      classes: "border-accent/40 bg-accent/5 text-accent",
    };
  }
  if (record && record.best !== null) {
    return {
      label: `Best ${formatScore(lab, record.best)}`,
      classes: "border-hairline bg-canvas-soft text-body-mid",
    };
  }
  return { label: "Open", classes: "border-hairline text-body-mid" };
}

export function LabTrails() {
  const [records, setRecords] = useState<LabRecords>({});

  useEffect(() => {
    const load = () => setRecords(getLabRecords());
    load();
    window.addEventListener(LAB_CHANGE_EVENT, load);
    window.addEventListener("storage", load);
    return () => {
      window.removeEventListener(LAB_CHANGE_EVENT, load);
      window.removeEventListener("storage", load);
    };
  }, []);

  const passedCount = LABS.filter((lab) => records[lab.id]?.passed).length;

  return (
    <section
      id="lab-trails"
      className="mx-auto w-full max-w-6xl scroll-mt-16 px-4 pb-12 pt-6 sm:px-6 sm:pb-16 sm:pt-8"
    >
      <p className="mb-5 font-mono text-sm text-body-mid">
        {passedCount} / {LABS.length} labs passed
      </p>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        {LAB_TRAILS.map((trail) => {
          const labs = trail.labIds
            .map((id) => LAB_BY_ID.get(id))
            .filter((lab): lab is Lab => lab !== undefined);
          const trailPassed = labs.filter(
            (lab) => records[lab.id]?.passed,
          ).length;
          return (
            <article
              key={trail.id}
              className="flex min-w-0 flex-col gap-3 rounded-lg border border-hairline bg-canvas-card p-4 sm:p-5"
            >
              <header className="flex min-w-0 flex-col gap-2">
                <div className="flex flex-wrap items-start justify-between gap-x-3 gap-y-1">
                  <h2 className="min-w-0 text-base font-semibold text-ink">
                    {trail.title}
                  </h2>
                  <span
                    className={cn(
                      "shrink-0 font-mono text-xs",
                      trailPassed === labs.length
                        ? "text-accent"
                        : "text-body-mid",
                    )}
                  >
                    {trailPassed}/{labs.length} passed
                  </span>
                </div>
                <p className="text-sm leading-relaxed text-body">
                  {trail.blurb}
                </p>
                <p className="text-xs leading-relaxed text-body-mid">
                  {trail.why}
                </p>
              </header>

              <ol className="flex flex-col gap-2">
                {labs.map((lab, index) => {
                  const status = statusChip(lab, records[lab.id]);
                  return (
                    <li key={lab.id} className="min-w-0">
                      <Link
                        href={`/labs/${lab.id}`}
                        className="flex flex-col gap-2 rounded-md border border-hairline bg-canvas p-3 transition-colors hover:bg-canvas-soft focus:outline-none focus-visible:outline focus-visible:outline-1 focus-visible:outline-accent"
                      >
                        <div className="flex min-w-0 items-start justify-between gap-3">
                          <span className="flex min-w-0 items-baseline gap-2">
                            <span className="shrink-0 font-mono text-[11px] text-mute">
                              {String(index + 1).padStart(2, "0")}
                            </span>
                            <span className="min-w-0 text-sm font-medium text-ink">
                              {lab.title}
                            </span>
                          </span>
                          <span
                            className={cn(
                              "shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-medium",
                              status.classes,
                            )}
                          >
                            {status.label}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="text-[11px] text-body-mid">
                            {lab.category}
                          </span>
                          <span
                            className="rounded-full border border-hairline px-2 py-0.5 text-[10px] text-body-mid"
                          >
                            {lab.difficulty}
                          </span>
                        </div>
                      </Link>
                    </li>
                  );
                })}
              </ol>
            </article>
          );
        })}
      </div>
    </section>
  );
}
