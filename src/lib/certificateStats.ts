import {
  getEligible,
  getIssued,
  type Certificate,
  type CertificateEntry,
} from "@/lib/certificates";

/**
 * Lazy-only stats for the certificates card. Kept out of `stats.ts` so the
 * certificates graph (paths, collections, categories, labs, projects,
 * interviews, research) never enters the /stats first-load bundle; the card
 * that imports this module mounts with `ssr: false` after hydration.
 */

/* ───────────────────────────── certificates ─────────────────────────────── */

/** Claimable milestones listed on the stats dashboard. */
export const CERTIFICATE_NEAR_LIMIT = 3;

/** Milestone kinds come straight from the certificates module's entries. */
type CertificateKind = CertificateEntry["kind"];

export interface CertificateMilestone {
  /** Stable `kind:refId` identity — matches issued certificate ids. */
  id: string;
  kind: CertificateKind;
  refId: string;
  title: string;
  detail: string;
  /**
   * Fraction of the milestone complete, 0..1. All-or-nothing kinds (paths,
   * collections, labs, projects, research) report 1 once eligible; category
   * and interview milestones can sit between their eligibility threshold and
   * full completion.
   */
  progress: number;
  /** Human progress, e.g. "412/420"; null when the milestone carries no counts. */
  progressText: string | null;
}

export interface CertificateStats {
  /** Certificates already claimed by the user. */
  issued: number;
  /** Eligible-but-unclaimed milestones, closest to complete first, capped. */
  near: CertificateMilestone[];
}

function isCertificateEntryShaped(value: unknown): value is CertificateEntry {
  if (typeof value !== "object" || value === null) return false;
  const entry = value as Record<string, unknown>;
  return (
    typeof entry.kind === "string" &&
    typeof entry.refId === "string" &&
    typeof entry.title === "string"
  );
}

function isCertificateShaped(value: unknown): value is Certificate {
  if (typeof value !== "object" || value === null) return false;
  const cert = value as Record<string, unknown>;
  return (
    typeof cert.id === "string" &&
    typeof cert.kind === "string" &&
    typeof cert.refId === "string"
  );
}

function milestoneProgress(entry: CertificateEntry): {
  progress: number;
  progressText: string | null;
} {
  const { solved, total } = entry;
  if (
    typeof solved === "number" &&
    typeof total === "number" &&
    Number.isFinite(solved) &&
    Number.isFinite(total) &&
    total > 0
  ) {
    return {
      progress: Math.max(0, Math.min(1, solved / total)),
      progressText: `${Math.round(solved)}/${Math.round(total)}`,
    };
  }
  return { progress: 1, progressText: null };
}

/** Zeroed certificate shape for empty state and server snapshots. */
export function emptyCertificateStats(): CertificateStats {
  return { issued: 0, near: [] };
}

/**
 * Pure derivation over the eligible and issued lists: counts claimed
 * certificates, then keeps the eligible milestones that have not been claimed
 * yet, ordered by how close they are to complete (highest progress first,
 * ties by title) and capped at `CERTIFICATE_NEAR_LIMIT`. Malformed entries
 * are skipped rather than throwing.
 */
export function deriveCertificateStats(
  eligible: CertificateEntry[],
  issued: Certificate[],
): CertificateStats {
  const eligibleList = Array.isArray(eligible) ? eligible : [];
  const issuedList = Array.isArray(issued) ? issued : [];

  const issuedKeys = new Set<string>();
  let issuedCount = 0;
  for (const cert of issuedList) {
    if (!isCertificateShaped(cert)) continue;
    issuedCount += 1;
    issuedKeys.add(`${cert.kind}:${cert.refId}`);
  }

  const near = eligibleList
    .filter(isCertificateEntryShaped)
    .filter((entry) => !issuedKeys.has(`${entry.kind}:${entry.refId}`))
    .map((entry) => {
      const { progress, progressText } = milestoneProgress(entry);
      return {
        id: `${entry.kind}:${entry.refId}`,
        kind: entry.kind,
        refId: entry.refId,
        title: entry.title,
        detail: typeof entry.detail === "string" ? entry.detail : "",
        progress,
        progressText,
      };
    })
    .sort(
      (a, b) =>
        b.progress - a.progress ||
        a.title.localeCompare(b.title) ||
        a.id.localeCompare(b.id),
    )
    .slice(0, CERTIFICATE_NEAR_LIMIT);

  return { issued: issuedCount, near };
}

/** Live certificate summary from the local certificate store. */
export function getCertificateStats(): CertificateStats {
  return deriveCertificateStats(getEligible(), getIssued());
}
