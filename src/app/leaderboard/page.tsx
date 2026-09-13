import type { Metadata } from "next";
import { Leaderboard } from "@/components/Leaderboard";
import { PageShell } from "@/components/PageShell";
import { SECTIONS_BY_ID } from "@/lib/sections";

const description =
  "Flame Score, current and longest streaks, and your rank among local solvers. Add a username to make it yours.";

export const metadata: Metadata = {
  title: "Leaderboard",
  description,
  alternates: {
    canonical: "/leaderboard",
  },
  openGraph: {
    title: "Leaderboard — DeepForge",
    description,
    url: "/leaderboard",
    type: "website",
    siteName: "DeepForge",
  },
};

export default function LeaderboardPage() {
  return (
    <PageShell
      title={SECTIONS_BY_ID.leaderboard.title}
      description={SECTIONS_BY_ID.leaderboard.blurb}
    >
      <Leaderboard />
    </PageShell>
  );
}
