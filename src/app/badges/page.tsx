import type { Metadata } from "next";
import { Badges } from "@/components/Badges";
import { SectionShell } from "@/components/SectionShell";

const description =
  "Level up as you solve. Quests and badges unlocked from your DeepForge progress.";

export const metadata: Metadata = {
  title: "Badges",
  description,
  alternates: {
    canonical: "/badges",
  },
  openGraph: {
    title: "Badges — DeepForge",
    description,
    url: "/badges",
    type: "website",
    siteName: "DeepForge",
  },
};

export default function BadgesPage() {
  return (
    <SectionShell>
      <Badges />
    </SectionShell>
  );
}
