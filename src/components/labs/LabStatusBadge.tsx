"use client";

import { useEffect, useState } from "react";
import type { Lab } from "@/data/labs";
import { LAB_CHANGE_EVENT, getLabRecords, type LabRecord } from "@/lib/labs";
import { cn } from "@/lib/utils";
import { formatScore } from "@/components/labs/helpers";

export function LabStatusBadge({ lab }: { lab: Lab }) {
  const [record, setRecord] = useState<LabRecord | null>(null);

  useEffect(() => {
    const load = () => setRecord(getLabRecords()[lab.id] ?? null);
    load();
    window.addEventListener(LAB_CHANGE_EVENT, load);
    return () => window.removeEventListener(LAB_CHANGE_EVENT, load);
  }, [lab.id]);

  if (!record || record.best === null) return null;

  return (
    <span
      className={cn(
        "rounded-full border px-2 py-0.5 text-xs font-medium",
        record.passed
          ? "border-accent/40 bg-accent/5 text-accent"
          : "border-hairline bg-canvas-card text-body-mid",
      )}
    >
      {record.passed ? "Passed" : `Best ${formatScore(lab, record.best)}`}
    </span>
  );
}
