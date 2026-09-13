"use client";

import { useEffect, useState, type ReactNode } from "react";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { getProgress, type ProgressMap } from "@/lib/progress";
import { MARKETING_PROBLEM_COUNT } from "@/lib/utils";

interface SectionShellProps {
  children?: ReactNode;
}

/**
 * Shared chrome for every standalone section route: header with live solved
 * counts, the page content, and the site footer. Counts are derived from the
 * progress map only — the five-megabyte problem dataset never enters this
 * component.
 */
export function SectionShell({ children }: SectionShellProps) {
  const [progress, setProgress] = useState<ProgressMap>(() => getProgress());

  useEffect(() => {
    const onChange = () => setProgress(getProgress());
    window.addEventListener("storage", onChange);
    window.addEventListener("deepforge:progress-change", onChange);
    return () => {
      window.removeEventListener("storage", onChange);
      window.removeEventListener("deepforge:progress-change", onChange);
    };
  }, []);

  let solvedCount = 0;
  for (const entry of Object.values(progress)) {
    if (entry?.solved) solvedCount += 1;
  }

  return (
    <div id="top" className="flex min-h-screen flex-col">
      <Header
        solvedCount={solvedCount}
        totalCount={MARKETING_PROBLEM_COUNT}
      />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
