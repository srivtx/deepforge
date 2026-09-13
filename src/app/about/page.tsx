import type { Metadata } from "next";
import { About } from "@/components/About";
import { PageShell } from "@/components/PageShell";
import { SECTIONS_BY_ID } from "@/lib/sections";

const description =
  "What DeepForge is, who built it, and why — a free, open-source practice platform for ML, math, and engineering.";

export const metadata: Metadata = {
  title: "About",
  description,
  alternates: {
    canonical: "/about",
  },
  openGraph: {
    title: "About — DeepForge",
    description,
    url: "/about",
    type: "website",
    siteName: "DeepForge",
  },
};

const { title, blurb } = SECTIONS_BY_ID.about;

export default function AboutPage() {
  return (
    <PageShell title={title} description={blurb}>
      <About />
    </PageShell>
  );
}
