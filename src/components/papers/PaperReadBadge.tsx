"use client";

import { useSyncExternalStore } from "react";
import {
  getEmptyPapersSnapshot,
  getPapersSnapshot,
  subscribePapersState,
} from "@/lib/papers";

/**
 * Small "Read" pill for the paper detail header. Renders nothing until the
 * store reports a read mark (SSR and the first client paint agree), then
 * appears once the paper has been opened on this device.
 */
export function PaperReadBadge({ paperId }: { paperId: string }) {
  const state = useSyncExternalStore(
    subscribePapersState,
    getPapersSnapshot,
    getEmptyPapersSnapshot,
  );
  if (!state.read[paperId]) return null;
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-accent/40 bg-canvas-card px-2 py-0.5 text-xs font-medium text-accent">
      <svg width="10" height="10" viewBox="0 0 12 12" fill="none" aria-hidden>
        <path
          d="M2 6.4 4.7 9 10 3.2"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      Read
    </span>
  );
}
