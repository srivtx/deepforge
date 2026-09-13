import type { Metadata } from "next";
import { PageShell } from "@/components/PageShell";
import { Speedrun } from "@/components/Speedrun";
import { SECTIONS_BY_ID } from "@/lib/sections";

const description =
  "A seeded solve-a-thon against the clock. Race through a random problem set and beat your own ghost.";

export const metadata: Metadata = {
  title: "Speedrun",
  description,
  alternates: {
    canonical: "/speedrun",
  },
  openGraph: {
    title: "Speedrun — DeepForge",
    description,
    url: "/speedrun",
    type: "website",
    siteName: "DeepForge",
  },
};

const { title, blurb } = SECTIONS_BY_ID.speedrun;

export default function SpeedrunPage() {
  return (
    <PageShell title={title} description={blurb}>
      <Speedrun />
    </PageShell>
  );
}
