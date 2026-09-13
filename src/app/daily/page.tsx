import type { Metadata } from "next";
import { DailyChallenge } from "@/components/DailyChallenge";
import { SectionShell } from "@/components/SectionShell";

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
    <SectionShell>
      <DailyChallenge />
    </SectionShell>
  );
}
