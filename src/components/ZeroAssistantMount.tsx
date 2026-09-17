"use client";

import dynamic from "next/dynamic";

/**
 * Client-only mount point for Zero, rendered from the root layout.
 *
 * The root layout is a Server Component, so `next/dynamic` with `ssr: false`
 * cannot live there (Turbopack rejects it). This thin Client Component owns
 * the lazy import instead: the assistant chunk is fetched after hydration and
 * never enters any route's first-load JS.
 */
const ZeroAssistant = dynamic(
  () =>
    import("@/components/ZeroAssistant").then((mod) => ({
      default: mod.ZeroAssistant,
    })),
  { ssr: false },
);

export function ZeroAssistantMount() {
  return <ZeroAssistant />;
}
