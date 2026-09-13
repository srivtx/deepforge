import type { Metadata } from "next";
import { PageShell } from "@/components/PageShell";
import { Playground } from "@/components/Playground";
import { SECTIONS_BY_ID } from "@/lib/sections";

const description =
  "A scratch pad that runs Python locally via Pyodide — test an idea without leaving the page.";

export const metadata: Metadata = {
  title: "Python playground",
  description,
  alternates: {
    canonical: "/playground",
  },
  openGraph: {
    title: "Python playground — DeepForge",
    description,
    url: "/playground",
    type: "website",
    siteName: "DeepForge",
  },
};

export default function PlaygroundPage() {
  return (
    <PageShell
      title={SECTIONS_BY_ID.playground.title}
      description={SECTIONS_BY_ID.playground.blurb}
    >
      <Playground />
    </PageShell>
  );
}
