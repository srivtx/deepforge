import type { Metadata } from "next";
import { Discuss } from "@/components/Discuss";
import { PageShell } from "@/components/PageShell";
import { SECTIONS_BY_ID } from "@/lib/sections";

const description =
  "Ask questions and read threads from other solvers. Every problem has its own discussion.";

export const metadata: Metadata = {
  title: "Discuss",
  description,
  alternates: {
    canonical: "/discuss",
  },
  openGraph: {
    title: "Discuss — DeepForge",
    description,
    url: "/discuss",
    type: "website",
    siteName: "DeepForge",
  },
};

export default function DiscussPage() {
  return (
    <PageShell
      title={SECTIONS_BY_ID.discuss.title}
      description={SECTIONS_BY_ID.discuss.blurb}
    >
      <Discuss variant="page" />
    </PageShell>
  );
}
