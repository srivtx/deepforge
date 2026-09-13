import type { Metadata } from "next";
import { SectionShell } from "@/components/SectionShell";
import { Sims } from "@/components/Sims";

const description =
  "Live simulations you can play, pause, and step through to build intuition for ML algorithms.";

export const metadata: Metadata = {
  title: "Simulations",
  description,
  alternates: {
    canonical: "/sims",
  },
  openGraph: {
    title: "Simulations — DeepForge",
    description,
    url: "/sims",
    type: "website",
    siteName: "DeepForge",
  },
};

export default function SimsPage() {
  return (
    <SectionShell>
      <Sims />
    </SectionShell>
  );
}
