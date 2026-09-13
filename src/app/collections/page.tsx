import type { Metadata } from "next";
import { Collections } from "@/components/Collections";
import { PageShell } from "@/components/PageShell";
import { SECTIONS_BY_ID } from "@/lib/sections";

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
    <PageShell
      title={SECTIONS_BY_ID.collections.title}
      description={SECTIONS_BY_ID.collections.blurb}
    >
      <Collections />
    </PageShell>
  );
}
