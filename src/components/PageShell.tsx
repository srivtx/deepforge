"use client";

import {
  useCallback,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { CommandPalette } from "@/components/CommandPalette";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { getProgress, type ProgressMap } from "@/lib/progress";
import { problemHref } from "@/lib/problemLinks";
import { MARKETING_PROBLEM_COUNT } from "@/lib/utils";

interface PageShellProps {
  children?: ReactNode;
  title?: string;
  description?: string;
  eyebrow?: string;
  actions?: ReactNode;
  width?: "default" | "wide" | "narrow";
}

const WIDTHS: Record<NonNullable<PageShellProps["width"]>, string> = {
  default: "max-w-6xl",
  wide: "max-w-7xl",
  narrow: "max-w-4xl",
};

/**
 * The single chrome for every route: header with live solved counts, the page
 * content, the site footer, and the command palette. Opening a problem is a
 * real navigation — components announce problems with the
 * `deepforge:open-problem` event and this shell routes to `/problems/<id>`,
 * so the workspace is the page itself rather than a stacked overlay.
 *
 * Pages that provide a `title` get one standard page header (the single H1 for
 * the route) so every destination starts with the same rhythm. The five
 * megabyte problem dataset is only ever loaded on demand.
 */
export function PageShell({
  children,
  title,
  description,
  eyebrow,
  actions,
  width = "default",
}: PageShellProps) {
  const router = useRouter();
  const [progress, setProgress] = useState<ProgressMap>(() => getProgress());

  const refreshProgress = useCallback(() => {
    setProgress(getProgress());
  }, []);

  useEffect(() => {
    window.addEventListener("storage", refreshProgress);
    window.addEventListener("deepforge:progress-change", refreshProgress);
    return () => {
      window.removeEventListener("storage", refreshProgress);
      window.removeEventListener("deepforge:progress-change", refreshProgress);
    };
  }, [refreshProgress]);

  // Forum chips, playlist items, speedrun rows, assistant citations, and the
  // practice browser all announce problems through this event.
  useEffect(() => {
    const onOpenProblem = (event: Event) => {
      const detail = (event as CustomEvent).detail;
      const id = detail?.id;
      if (typeof id !== "string" || id.length === 0) return;
      router.push(problemHref(id, detail?.from));
    };
    window.addEventListener("deepforge:open-problem", onOpenProblem);
    return () =>
      window.removeEventListener("deepforge:open-problem", onOpenProblem);
  }, [router]);

  let solvedCount = 0;
  for (const entry of Object.values(progress)) {
    if (entry?.solved) solvedCount += 1;
  }

  const container = `mx-auto w-full ${WIDTHS[width]} px-4 sm:px-6`;

  return (
    <div id="top" className="flex min-h-screen flex-col">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60] focus:rounded-md focus:border focus:border-hairline focus:bg-canvas focus:px-3 focus:py-2 focus:text-sm focus:text-ink"
      >
        Skip to content
      </a>
      <Header solvedCount={solvedCount} totalCount={MARKETING_PROBLEM_COUNT} />
      <main id="main" className="flex-1">
        {title && (
          <div className={`${container} pt-10 sm:pt-14`}>
            <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div className="min-w-0">
                {eyebrow && (
                  <p className="mb-1.5 text-[11px] font-medium uppercase tracking-[0.14em] text-mute">
                    {eyebrow}
                  </p>
                )}
                <h1 className="text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
                  {title}
                </h1>
                {description && (
                  <p className="mt-2 max-w-2xl text-sm leading-relaxed text-body-mid">
                    {description}
                  </p>
                )}
              </div>
              {actions && (
                <div className="flex shrink-0 items-center gap-2">{actions}</div>
              )}
            </header>
          </div>
        )}
        {children}
      </main>
      <Footer />
      <CommandPalette />
    </div>
  );
}
