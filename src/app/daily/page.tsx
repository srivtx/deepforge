import type { Metadata } from "next";
import { DailyChallenge } from "@/components/DailyChallenge";
import { PageShell } from "@/components/PageShell";
import { SECTIONS_BY_ID } from "@/lib/sections";

const description =
  "One problem picked for everyone each day. Solve today's Daily Challenge in the browser and keep your streak alive.";

export const metadata: Metadata = {
  title: "Daily Challenge",
  description,
  alternates: {
    canonical: "/daily",
  },
  openGraph: {
    title: "Daily Challenge — DeepForge",
    description,
    url: "/daily",
    type: "website",
    siteName: "DeepForge",
  },
};

export default function DailyPage() {
  return (
    <PageShell
      title={SECTIONS_BY_ID.daily.title}
      description={SECTIONS_BY_ID.daily.blurb}
    >
      <DailyChallenge />
    </PageShell>
  );
}
