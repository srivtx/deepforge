"use client";

import { useEffect, useState } from "react";
import { Paths } from "@/components/Paths";
import { getProgress, type ProgressMap } from "@/lib/progress";
import type { LearningPath, Problem } from "@/types/problem";

interface PathsBrowserProps {
  paths: LearningPath[];
  problems: Problem[];
}

/**
 * Client boundary for the paths page: reads localStorage progress after mount
 * (so SSR markup and hydration agree) and keeps it in sync with the rest of
 * the app via the shared progress events.
 */
export function PathsBrowser({ paths, problems }: PathsBrowserProps) {
  const [progress, setProgress] = useState<ProgressMap>({});

  useEffect(() => {
    const load = () => setProgress(getProgress());
    load();
    window.addEventListener("storage", load);
    window.addEventListener("deepforge:progress-change", load);
    return () => {
      window.removeEventListener("storage", load);
      window.removeEventListener("deepforge:progress-change", load);
    };
  }, []);

  return <Paths paths={paths} problems={problems} progress={progress} />;
}
