import { cn } from "@/lib/utils";
import type { CertificateKind } from "@/lib/certificates";

/* ───────────────────────────── layout system ────────────────────────────── */
/**
 * The shared chrome for the certificates page: one container, one section
 * rhythm, one header recipe, one badge recipe, and one two-up card grid. The
 * catalog rows live in Certificates.tsx and reuse the same fixed column
 * template so every kind of row lines up.
 */

/** One container for the whole page; matches PageShell's content width. */
export const PAGE_CONTAINER =
  "mx-auto w-full max-w-6xl px-4 pb-16 pt-8 sm:px-6 sm:pb-20 sm:pt-10";

/** Vertical rhythm between major sections. */
export const SECTION_GAP = "mt-10 sm:mt-14";

/** Two-up card grid used by tracks and issued certificates; rows stretch. */
export const CARD_GRID = "mt-4 grid grid-cols-1 gap-3 sm:gap-4 lg:grid-cols-2";

/** Shared section header: title + description left, mono meta right. */
export function SectionHeader({
  id,
  title,
  description,
  meta,
}: {
  id: string;
  title: string;
  description: string;
  meta?: string;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-x-4 gap-y-1">
      <div className="min-w-0">
        <h2 id={id} className="text-base font-semibold tracking-tight text-ink">
          {title}
        </h2>
        <p className="mt-0.5 text-xs leading-relaxed text-body-mid">
          {description}
        </p>
      </div>
      {meta ? (
        <span className="shrink-0 font-mono text-[11px] text-mute">{meta}</span>
      ) : null}
    </div>
  );
}

/** One badge recipe so level, kind, and issued chips share a height. */
export const BADGE =
  "inline-flex items-center rounded-full border px-2 py-0.5 text-[11px]";

export function IssuedBadge({ label = "Issued" }: { label?: string }) {
  return (
    <span
      className={cn(BADGE, "border-accent/40 bg-accent/5 font-medium text-accent")}
    >
      {label}
    </span>
  );
}

/** Locked catalog rows classify themselves with a kind chip. */
export const KIND_LABELS: Record<CertificateKind, string> = {
  path: "Path",
  collection: "Collection",
  category: "Category",
  lab: "Lab",
  project: "Project",
  interview: "Interview",
  research: "Research",
  track: "Track",
};

export function KindBadge({ kind }: { kind: CertificateKind }) {
  return (
    <span className={cn(BADGE, "border-hairline text-mute")}>
      {KIND_LABELS[kind]}
    </span>
  );
}
