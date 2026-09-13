"use client";

import type { ReactNode } from "react";
import { PageShell } from "@/components/PageShell";

interface SectionShellProps {
  children?: ReactNode;
  title?: string;
  description?: string;
  eyebrow?: string;
}

/**
 * Back-compat wrapper. New routes should use PageShell directly; this exists
 * so older route files keep working while the page polish wave migrates them.
 */
export function SectionShell({
  children,
  title,
  description,
  eyebrow,
}: SectionShellProps) {
  return (
    <PageShell title={title} description={description} eyebrow={eyebrow}>
      {children}
    </PageShell>
  );
}
