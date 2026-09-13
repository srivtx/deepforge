import type { Metadata } from "next";
import { About } from "@/components/About";
import { SectionShell } from "@/components/SectionShell";

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

export default function AboutPage() {
  return (
    <SectionShell>
      <About />
    </SectionShell>
  );
}
