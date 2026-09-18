import type { Metadata } from "next";
import { PageShell } from "@/components/PageShell";
import { KeyFuseLab } from "@/components/keyfuse/KeyFuseLab";

const TITLE = "KeyFuse cache-key auditor";
const DESCRIPTION =
  "A read-only browser lab that probes a task's declared inputs for undeclared slot dependence, prints a minimal same-key / different-output witness, and builds a repaired key from everything it detected. No storage, no network, no grading.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: {
    canonical: "/keyfuse",
  },
  openGraph: {
    title: "KeyFuse cache-key auditor — DeepForge",
    description: DESCRIPTION,
    url: "/keyfuse",
    type: "website",
    siteName: "DeepForge",
  },
  twitter: {
    card: "summary",
    title: "KeyFuse cache-key auditor — DeepForge",
    description: DESCRIPTION,
  },
};

const NOT_CLAIMED: readonly string[] = [
  "A repaired key is conservative: it contains everything the audit detected, not everything that exists.",
  "A miss is reported, but it is not evidence that the rest of the universe is irrelevant.",
  "The sampled domains and the chosen strength bound what can be seen; an effect outside them can escape every arm.",
  "The short keys are identifiers for this lab, not a security boundary.",
  "Nothing here is a grade. This page stores nothing, syncs nothing, and sends nothing.",
];

export default function KeyFusePage() {
  return (
    <PageShell title={TITLE} description={DESCRIPTION}>
      <KeyFuseLab />
      <section
        aria-label="What this is not"
        className="mx-auto w-full max-w-6xl px-4 pb-12 sm:px-6 sm:pb-16"
      >
        <div className="rounded-lg border border-hairline bg-canvas-card p-4 sm:p-5">
          <h2 className="text-sm font-medium text-ink">What this is not</h2>
          <ul className="mt-2 flex list-disc flex-col gap-1 pl-4 text-xs leading-relaxed text-body-mid">
            {NOT_CLAIMED.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </section>
    </PageShell>
  );
}
