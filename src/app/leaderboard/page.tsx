import type { Metadata } from "next";
import { Leaderboard } from "@/components/Leaderboard";
import { SectionShell } from "@/components/SectionShell";

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
    <SectionShell>
      <Leaderboard />
    </SectionShell>
  );
}
