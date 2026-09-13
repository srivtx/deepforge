import type { Metadata } from "next";
import { Playground } from "@/components/Playground";
import { SectionShell } from "@/components/SectionShell";

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
    <SectionShell>
      <Playground />
    </SectionShell>
  );
}
