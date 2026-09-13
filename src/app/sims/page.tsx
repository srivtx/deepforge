import type { Metadata } from "next";
import { PageShell } from "@/components/PageShell";
import { Sims } from "@/components/Sims";
import { SECTIONS_BY_ID } from "@/lib/sections";

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

const { title, blurb } = SECTIONS_BY_ID.sims;

export default function SimsPage() {
  return (
    <PageShell title={title} description={blurb}>
      <Sims />
    </PageShell>
  );
}
