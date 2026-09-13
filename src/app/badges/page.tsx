import type { Metadata } from "next";
import { Badges } from "@/components/Badges";
import { PageShell } from "@/components/PageShell";
import { SECTIONS_BY_ID } from "@/lib/sections";

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
    <PageShell
      title={SECTIONS_BY_ID.badges.title}
      description={SECTIONS_BY_ID.badges.blurb}
    >
      <Badges />
    </PageShell>
  );
}
