import type { Metadata } from "next";
import { Labs } from "@/components/Labs";
import { PageShell } from "@/components/PageShell";
import { SECTIONS_BY_ID } from "@/lib/sections";

const description =
  "Dataset-driven machine learning labs where your implementation is scored against a held-out benchmark. Tune, iterate, and climb the leaderboard.";

export const metadata: Metadata = {
  title: "Hands-on ML labs",
  description,
  alternates: {
    canonical: "/labs",
  },
  openGraph: {
    title: "Hands-on ML labs — DeepForge",
    description,
    url: "/labs",
    type: "website",
    siteName: "DeepForge",
  },
};

const { title, blurb } = SECTIONS_BY_ID.labs;

export default function LabsPage() {
  return (
    <PageShell title={title} description={blurb}>
      <Labs />
    </PageShell>
  );
}
