import type { Metadata } from "next";
import { Certificates } from "@/components/Certificates";
import { PageShell } from "@/components/PageShell";
import { SECTIONS_BY_ID } from "@/lib/sections";

const description =
  "Claim printable certificates for completed paths, collections, and categories. Free, no account needed.";

export const metadata: Metadata = {
  title: "Certificates",
  description,
  alternates: {
    canonical: "/certificates",
  },
  openGraph: {
    title: "Certificates — DeepForge",
    description,
    url: "/certificates",
    type: "website",
    siteName: "DeepForge",
  },
};

export default function CertificatesPage() {
  return (
    <PageShell
      title={SECTIONS_BY_ID.certificates.title}
      description={SECTIONS_BY_ID.certificates.blurb}
    >
      <Certificates />
    </PageShell>
  );
}
