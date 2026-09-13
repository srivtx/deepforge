import type { Metadata } from "next";
import { SectionShell } from "@/components/SectionShell";
import { Speedrun } from "@/components/Speedrun";

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

export default function SpeedrunPage() {
  return (
    <SectionShell>
      <Speedrun />
    </SectionShell>
  );
}
