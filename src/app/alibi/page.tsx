import type { Metadata } from "next";
import { PageShell } from "@/components/PageShell";
import { AlibiHunt } from "@/components/alibi/AlibiHunt";

const TITLE = "Silent Bug Hunt";
const DESCRIPTION =
  "A Python program that passes every shipped test and is one line away from the reference. Find an input where the two diverge. Practice only — nothing here affects your progress, review schedule, or certificates.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: {
    canonical: "/alibi",
  },
  openGraph: {
    title: "Silent Bug Hunt — DeepForge",
    description: DESCRIPTION,
    url: "/alibi",
    type: "website",
    siteName: "DeepForge",
  },
  twitter: {
    card: "summary",
    title: "Silent Bug Hunt — DeepForge",
    description: DESCRIPTION,
  },
};

export default function AlibiPage() {
  return (
    <PageShell title={TITLE} description={DESCRIPTION}>
      <AlibiHunt />
    </PageShell>
  );
}
