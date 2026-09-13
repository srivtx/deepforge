"use client";

import { useSyncExternalStore, type ReactNode } from "react";
import { ProblemView } from "@/components/ProblemView";
import type { Problem } from "@/types/problem";

interface ProblemWorkspaceProps {
  problem: Problem;
  /**
   * Server-rendered problem content (description, starter code, hint, test
   * cases). It stays in the static HTML for crawlers and no-JS readers and is
   * swapped for the interactive editor once the client has hydrated.
   */
  children: ReactNode;
}

function subscribe(): () => void {
  return () => {};
}

function getClientSnapshot(): boolean {
  return true;
}

function getServerSnapshot(): boolean {
  return false;
}

/**
 * The /problems/[id] workspace. The server renders the full problem article
 * passed as `children`; once hydrated, the interactive `ProblemView` in page
 * mode takes over so the URL in the address bar is the workspace itself — no
 * overlay, no dialog semantics.
 */
export function ProblemWorkspace({ problem, children }: ProblemWorkspaceProps) {
  const interactive = useSyncExternalStore(
    subscribe,
    getClientSnapshot,
    getServerSnapshot,
  );

  if (!interactive) return <>{children}</>;
  return <ProblemView problem={problem} variant="page" />;
}
