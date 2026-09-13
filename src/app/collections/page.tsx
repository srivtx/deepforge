import type { Metadata } from "next";
import { Collections } from "@/components/Collections";
import { SectionShell } from "@/components/SectionShell";

const description =
  "Curated problem sets plus your own collections. Build a set, share it with a link, and track completion.";

export const metadata: Metadata = {
  title: "Collections",
  description,
  alternates: {
    canonical: "/collections",
  },
  openGraph: {
    title: "Collections — DeepForge",
    description,
    url: "/collections",
    type: "website",
    siteName: "DeepForge",
  },
};

export default function CollectionsPage() {
  return (
    <SectionShell>
      <Collections />
    </SectionShell>
  );
}
