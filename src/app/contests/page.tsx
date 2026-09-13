import type { Metadata } from "next";
import { Contests } from "@/components/Contests";
import { SectionShell } from "@/components/SectionShell";

const description =
  "Timed problem sets from 10 to 60 minutes with a countdown, difficulty-weighted scores, and best results saved in your browser.";

export const metadata: Metadata = {
  title: "Timed contests",
  description,
  alternates: {
    canonical: "/contests",
  },
  openGraph: {
    title: "Timed contests — DeepForge",
    description,
    url: "/contests",
    type: "website",
    siteName: "DeepForge",
  },
};

export default function ContestsPage() {
  return (
    <SectionShell>
      <Contests />
    </SectionShell>
  );
}
