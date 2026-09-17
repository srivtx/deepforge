import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { PageShell } from "@/components/PageShell";
import { PREMADE_COLLECTIONS } from "@/data/collections";
import { CATEGORIES } from "@/data/problems/meta";
import {
  CREDENTIAL_PREFIX,
  formatFingerprint,
  verifyCredential,
  type CredentialKind,
  type CredentialPayload,
  type CredentialStatus,
  type CredentialVerification,
} from "@/lib/credentials";
import { getPathBySlug } from "@/lib/paths";
import { categorySlug } from "@/lib/sections";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Certificate verification",
  description:
    "Check a DeepForge certificate code offline. Verification is deterministic math — no account and no server secret.",
  alternates: {
    canonical: "/verify",
  },
  robots: {
    index: false,
    follow: true,
  },
};

const KIND_LABELS: Record<CredentialKind, string> = {
  path: "Learning path",
  collection: "Collection",
  category: "Category milestone",
};

const LINK =
  "rounded-sm text-accent underline decoration-accent/40 underline-offset-2 transition-colors hover:decoration-accent focus:outline-none focus-visible:ring-1 focus-visible:ring-accent/40";

function targetFor(
  payload: CredentialPayload,
): { href: string; label: string } | null {
  if (payload.kind === "path") {
    const path = getPathBySlug(payload.ref);
    if (path) return { href: `/paths/${path.slug}`, label: path.title };
  }
  if (payload.kind === "collection") {
    const collection = PREMADE_COLLECTIONS.find(
      (entry) => entry.id === payload.ref,
    );
    if (collection) {
      return { href: `/collections/${collection.id}`, label: collection.name };
    }
  }
  if (payload.kind === "category") {
    const category = CATEGORIES.find(
      (entry) => categorySlug(entry.name) === payload.ref,
    );
    if (category) {
      return {
        href: `/categories/${categorySlug(category.name)}`,
        label: category.name,
      };
    }
  }
  return null;
}

function StatusIcon({ status }: { status: CredentialStatus }) {
  const valid = status === "valid";
  return (
    <span
      aria-hidden
      className={cn(
        "flex h-9 w-9 shrink-0 items-center justify-center rounded-full border",
        valid
          ? "border-accent/50 bg-accent/10 text-accent"
          : "border-hairline bg-canvas-soft text-mute",
      )}
    >
      <svg
        viewBox="0 0 20 20"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-4 w-4"
      >
        {valid ? (
          <path d="M4.5 10.5 8 14l7.5-8" />
        ) : (
          <path d="M5 10h10" />
        )}
      </svg>
    </span>
  );
}

function StatusBadge({ status }: { status: CredentialStatus }) {
  const valid = status === "valid";
  return (
    <span
      className={cn(
        "rounded-full border px-2 py-0.5 font-mono text-[11px] font-medium tracking-[0.14em]",
        valid
          ? "border-accent/50 bg-accent/10 text-accent"
          : "border-hairline bg-canvas-soft text-mute",
      )}
    >
      {valid ? "VALID" : "INVALID"}
    </span>
  );
}

function Summary({ payload }: { payload: CredentialPayload }) {
  const target = targetFor(payload);
  const rows: { label: string; value: ReactNode }[] = [
    { label: "Recipient", value: payload.recipient },
    { label: "Scope", value: KIND_LABELS[payload.kind] },
    { label: "Title", value: payload.title },
    {
      label: "Completed",
      value: `${payload.solved} of ${payload.total} problems`,
    },
    { label: "Issued", value: payload.issued },
  ];
  return (
    <div>
      <dl className="divide-y divide-hairline overflow-hidden rounded-lg border border-hairline">
        {rows.map((row) => (
          <div
            key={row.label}
            className="flex flex-col gap-0.5 bg-canvas-card px-3 py-2.5 sm:grid sm:grid-cols-[7.5rem_1fr] sm:gap-3 sm:px-4"
          >
            <dt className="text-[11px] uppercase tracking-[0.12em] text-mute">
              {row.label}
            </dt>
            <dd className="break-words text-sm text-ink">{row.value}</dd>
          </div>
        ))}
      </dl>
      {target && (
        <p className="mt-3 text-sm text-body-mid">
          Continue with{" "}
          <Link href={target.href} className={LINK}>
            {target.label}
          </Link>
          .
        </p>
      )}
    </div>
  );
}

function FingerprintLine({ value }: { value: string }) {
  return (
    <p className="mt-3 text-xs text-body-mid">
      SHA-256 fingerprint{" "}
      <code className="break-all font-mono text-[11px] tracking-[0.12em] text-body">
        {formatFingerprint(value)}
      </code>
    </p>
  );
}

function ValidPanel({ verification }: { verification: CredentialVerification }) {
  const payload = verification.payload;
  if (!payload) return null;
  return (
    <section
      aria-labelledby="verify-status"
      className="rounded-xl border border-accent/35 bg-accent/5 p-4 sm:p-6"
    >
      <div className="flex items-start gap-3">
        <StatusIcon status="valid" />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2
              id="verify-status"
              className="text-base font-semibold text-ink"
            >
              Valid certificate
            </h2>
            <StatusBadge status="valid" />
          </div>
          <p className="mt-1 text-sm leading-relaxed text-body-mid">
            The fingerprint stored in this code matches the payload exactly.
            Nothing in the evidence was altered after issue.
          </p>
        </div>
      </div>

      <div className="mt-5">
        <Summary payload={payload} />
        {verification.recomputed && (
          <FingerprintLine value={verification.recomputed} />
        )}
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <div className="rounded-lg border border-hairline bg-canvas-card p-3.5">
          <h3 className="text-xs font-medium text-ink">How this check works</h3>
          <p className="mt-1.5 text-xs leading-relaxed text-body-mid">
            The code carries the canonical JSON payload and a SHA-256
            fingerprint of it. This page decodes the payload, re-hashes it, and
            compares. That is deterministic offline math — no account, no
            server secret, no database lookup.
          </p>
        </div>
        <div className="rounded-lg border border-hairline bg-canvas-card p-3.5">
          <h3 className="text-xs font-medium text-ink">What it proves</h3>
          <p className="mt-1.5 text-xs leading-relaxed text-body-mid">
            That the fields above were not changed after the certificate was
            issued. It is self-attested: the work behind the certificate was
            not independently audited, and signed credentials are a later
            phase.
          </p>
        </div>
      </div>
    </section>
  );
}

function InvalidPanel({
  verification,
}: {
  verification: CredentialVerification;
}) {
  const tampered = verification.status === "tampered";
  return (
    <section
      aria-labelledby="verify-status"
      className="rounded-xl border border-hairline bg-canvas-card p-4 sm:p-6"
    >
      <div className="flex items-start gap-3">
        <StatusIcon status={verification.status} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2
              id="verify-status"
              className="text-base font-semibold text-ink"
            >
              {tampered
                ? "This code does not match its evidence"
                : "This does not look like a certificate code"}
            </h2>
            <StatusBadge status={verification.status} />
          </div>
          <p className="mt-1 text-sm leading-relaxed text-body-mid">
            {tampered
              ? "The payload decodes, but its SHA-256 fingerprint does not match the one stored in the code. Something was changed after issue — an edited field, a mistyped character, or a truncated link."
              : `A code has three dot-separated parts: the ${CREDENTIAL_PREFIX} marker, the encoded payload, and a 16-character base32 fingerprint. This one could not be read — it may have been truncated or edited while copying.`}
          </p>
        </div>
      </div>

      {tampered && verification.payload && (
        <div className="mt-5">
          <h3 className="text-xs font-medium text-ink">
            Embedded data (unverified)
          </h3>
          <p className="mt-1 text-xs leading-relaxed text-body-mid">
            This is what the altered code claims, not confirmed evidence.
          </p>
          <div className="mt-2.5">
            <Summary payload={verification.payload} />
          </div>
          <dl className="mt-3 space-y-1 rounded-lg border border-hairline bg-canvas p-3 font-mono text-[11px] text-body-mid">
            <div className="flex flex-wrap items-baseline gap-2">
              <dt className="uppercase tracking-[0.12em] text-mute">
                Embedded
              </dt>
              <dd className="break-all tracking-[0.12em] text-body">
                {verification.fingerprint
                  ? formatFingerprint(verification.fingerprint)
                  : "unreadable"}
              </dd>
            </div>
            <div className="flex flex-wrap items-baseline gap-2">
              <dt className="uppercase tracking-[0.12em] text-mute">
                Recomputed
              </dt>
              <dd className="break-all tracking-[0.12em] text-body">
                {verification.recomputed
                  ? formatFingerprint(verification.recomputed)
                  : "unavailable"}
              </dd>
            </div>
          </dl>
        </div>
      )}

      {!tampered && verification.reason === "version" && (
        <p className="mt-4 text-sm text-body-mid">
          The code is readable but uses a credential version this page does not
          know yet.
        </p>
      )}

      <p className="mt-5 text-sm text-body-mid">
        Certificates you own list their current codes on{" "}
        <Link href="/certificates" className={LINK}>
          the certificates page
        </Link>
        . If you copied a link, try opening it again from there.
      </p>
    </section>
  );
}

function UnavailablePanel() {
  return (
    <section
      aria-labelledby="verify-status"
      className="rounded-xl border border-hairline bg-canvas-card p-4 sm:p-6"
    >
      <div className="flex items-start gap-3">
        <StatusIcon status="malformed" />
        <div className="min-w-0 flex-1">
          <h2 id="verify-status" className="text-base font-semibold text-ink">
            Verification is unavailable here
          </h2>
          <p className="mt-1 text-sm leading-relaxed text-body-mid">
            This environment could not run the SHA-256 check, so the code was
            neither confirmed nor rejected. Try again from a current browser.
          </p>
        </div>
      </div>
    </section>
  );
}

export default async function VerifyPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;

  let verification: CredentialVerification | null = null;
  try {
    verification = await verifyCredential(code);
  } catch {
    verification = null;
  }

  return (
    <PageShell
      title="Certificate verification"
      description={
        verification?.status === "valid"
          ? "Check the evidence behind a DeepForge certificate. This page re-verifies the code with deterministic SHA-256 math."
          : "Paste or open a certificate code to check whether its evidence is intact. No account or server secret is involved."
      }
    >
      <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 sm:py-10">
        {verification === null && <UnavailablePanel />}
        {verification?.status === "valid" && (
          <ValidPanel verification={verification} />
        )}
        {verification !== null && verification.status !== "valid" && (
          <InvalidPanel verification={verification} />
        )}

        <p className="mt-6 text-[11px] leading-relaxed text-mute">
          Verification is the same for everyone: decode the payload, normalize
          it to canonical JSON, hash it with SHA-256, and compare fingerprints.
          Nothing here depends on this server staying online or on a private
          key.
        </p>
      </div>
    </PageShell>
  );
}
