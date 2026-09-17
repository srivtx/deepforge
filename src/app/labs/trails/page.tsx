import type { Metadata } from "next";
import { LabTrails } from "@/components/labTrails/LabTrails";
import { PageShell } from "@/components/PageShell";

const description =
  "Short ordered sequences that turn the eight hands-on labs into guided arcs: regression fundamentals, classification from scratch, structure and representations, and the failure modes that trip up a reasonable baseline. Progress reads from your own scored runs.";

export const metadata: Metadata = {
  title: "Lab trails",
  description,
  alternates: {
    canonical: "/labs/trails",
  },
  openGraph: {
    title: "Lab trails — DeepForge",
    description,
    url: "/labs/trails",
    type: "website",
    siteName: "DeepForge",
  },
  twitter: {
    card: "summary_large_image",
    title: "Lab trails — DeepForge",
    description,
  },
};

export default function LabTrailsPage() {
  return (
    <PageShell
      title="Lab trails"
      description="Short ordered sequences through the labs, with progress read live from your scored runs."
    >
      <LabTrails />
    </PageShell>
  );
}
