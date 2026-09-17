"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";
import { CERTIFICATES_CHANGE_EVENT } from "@/lib/certificates";
import {
  emptyCertificateStats,
  getCertificateStats,
  type CertificateMilestone,
  type CertificateStats,
} from "@/lib/certificateStats";

function getSnapshot(): CertificateStats {
  return getCertificateStats();
}

function getServerSnapshot(): CertificateStats {
  return emptyCertificateStats();
}

function subscribe(onStoreChange: () => void): () => void {
  const onChange = () => onStoreChange();
  window.addEventListener(CERTIFICATES_CHANGE_EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(CERTIFICATES_CHANGE_EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}

function CertificateRow({ entry }: { entry: CertificateMilestone }) {
  const percent = Math.round(entry.progress * 100);
  return (
    <li>
      <Link
        href="/certificates"
        aria-label={`${entry.title}${
          entry.progressText ? `: ${entry.progressText}` : ""
        }${entry.detail ? ` — ${entry.detail}` : ""} — open certificates`}
        className="flex items-center justify-between gap-3 rounded-lg border border-hairline bg-canvas px-3 py-2 transition-colors hover:bg-canvas-soft focus:outline-none focus-visible:ring-1 focus-visible:ring-accent/40"
      >
        <span
          className="min-w-0 flex-1 truncate text-xs text-ink"
          title={entry.detail || undefined}
        >
          {entry.title}
        </span>
        <span className="shrink-0 font-mono text-[10px] text-body-mid">
          {entry.progressText ?? `${percent}%`}
        </span>
      </Link>
    </li>
  );
}

export function CertificatesCard() {
  const certificates = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );

  return (
    <div className="rounded-lg border border-hairline bg-canvas-card p-4 sm:p-5">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="text-sm font-medium text-ink">Certificates</h3>
        <span className="font-mono text-[10px] text-body-mid">
          {certificates.issued} issued
        </span>
      </div>
      <p className="mt-1 text-xs text-body-mid">
        Claimable milestones from your local progress, closest first.
      </p>

      {certificates.near.length === 0 ? (
        <Link
          href="/certificates"
          className="mt-4 block rounded-lg border border-hairline bg-canvas px-4 py-6 text-center text-xs text-body-mid transition-colors hover:bg-canvas-soft hover:text-ink focus:outline-none focus-visible:ring-1 focus-visible:ring-accent/40"
        >
          No certificate ready yet — see what&apos;s closest
        </Link>
      ) : (
        <ul className="mt-4 space-y-2">
          {certificates.near.map((entry) => (
            <CertificateRow key={entry.id} entry={entry} />
          ))}
        </ul>
      )}

      <div className="mt-3 text-[10px]">
        <Link
          href="/certificates"
          className="text-accent hover:underline focus:outline-none focus-visible:ring-1 focus-visible:ring-accent/40"
        >
          All certificates
        </Link>
      </div>
    </div>
  );
}
