import type { Metadata } from "next";
import { PageShell } from "@/components/PageShell";
import { StatsDashboard } from "@/components/StatsDashboard";
import { SECTIONS_BY_ID } from "@/lib/sections";

const description =
  "Solved counts, accuracy, streaks, a difficulty breakdown, and an estimated mastery score across all 15 categories.";

export const metadata: Metadata = {
  title: "Stats",
  description,
  alternates: {
    canonical: "/stats",
  },
  openGraph: {
    title: "Stats — DeepForge",
    description,
    url: "/stats",
    type: "website",
    siteName: "DeepForge",
  },
};

export default function StatsPage() {
  return (
    <PageShell
      title={SECTIONS_BY_ID.stats.title}
      description={SECTIONS_BY_ID.stats.blurb}
    >
      <StatsDashboard />
    </PageShell>
  );
}
