import type { Metadata } from "next";
import { Certificates } from "@/components/Certificates";
import { SectionShell } from "@/components/SectionShell";

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
    <SectionShell>
      <Certificates />
    </SectionShell>
  );
}
