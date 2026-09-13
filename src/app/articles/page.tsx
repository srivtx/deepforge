import type { Metadata } from "next";
import { Articles } from "@/components/Articles";
import { PageShell } from "@/components/PageShell";
import { SECTIONS_BY_ID } from "@/lib/sections";

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

const { title, blurb } = SECTIONS_BY_ID.articles;

export default function ArticlesPage() {
  return (
    <PageShell title={title} description={blurb}>
      <Articles />
    </PageShell>
  );
}
