import type { Metadata } from "next";
import { PageShell } from "@/components/PageShell";
import { TodayScreen } from "@/components/today/Today";
import { SECTIONS_BY_ID } from "@/lib/sections";

const description =
  "One pre-built session: today's daily problem, your spaced-repetition reviews, one weak-area pick, and your streak and quests — no decisions required.";

export const metadata: Metadata = {
  title: "Today",
  description,
  alternates: {
    canonical: "/today",
  },
  openGraph: {
    title: "Today — DeepForge",
    description,
    url: "/today",
    type: "website",
    siteName: "DeepForge",
  },
};

export default function TodayPage() {
  return (
    <PageShell
      title={SECTIONS_BY_ID.today.title}
      description={SECTIONS_BY_ID.today.blurb}
    >
      <TodayScreen />
    </PageShell>
  );
}
