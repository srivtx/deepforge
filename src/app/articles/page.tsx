import type { Metadata } from "next";
import { Articles } from "@/components/Articles";
import { SectionShell } from "@/components/SectionShell";

const description =
  "Interactive lessons with live demos that run Python in the page — learn a concept, then try it.";

export const metadata: Metadata = {
  title: "Articles",
  description,
  alternates: {
    canonical: "/articles",
  },
  openGraph: {
    title: "Articles — DeepForge",
    description,
    url: "/articles",
    type: "website",
    siteName: "DeepForge",
  },
};

export default function ArticlesPage() {
  return (
    <SectionShell>
      <Articles />
    </SectionShell>
  );
}
