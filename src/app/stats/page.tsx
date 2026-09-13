import type { Metadata } from "next";
import { SectionShell } from "@/components/SectionShell";
import { StatsDashboard } from "@/components/StatsDashboard";

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
    <SectionShell>
      <StatsDashboard />
    </SectionShell>
  );
}
