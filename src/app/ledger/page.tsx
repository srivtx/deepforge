import type { Metadata } from "next";
import { PageShell } from "@/components/PageShell";
import { LedgerPicker } from "@/components/ledger/LedgerPicker";

const TITLE = "Behavioral Delta Ledger";
const DESCRIPTION =
  "An opt-in practice view that reports whether an edit changed your program's behavior on hidden checks built from an exercise's own tests — counts only, never a grade, never part of review or certificates.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: {
    canonical: "/ledger",
  },
  openGraph: {
    title: "Behavioral Delta Ledger — DeepForge",
    description: DESCRIPTION,
    url: "/ledger",
    type: "website",
    siteName: "DeepForge",
  },
  twitter: {
    card: "summary",
    title: "Behavioral Delta Ledger — DeepForge",
    description: DESCRIPTION,
  },
};

export default function LedgerPage() {
  return (
    <PageShell title={TITLE} description={DESCRIPTION}>
      <LedgerPicker />
    </PageShell>
  );
}
