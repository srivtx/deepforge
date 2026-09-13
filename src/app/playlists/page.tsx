import type { Metadata } from "next";
import { PageShell } from "@/components/PageShell";
import { Playlists } from "@/components/Playlists";
import { SECTIONS_BY_ID } from "@/lib/sections";

const description =
  "Build, reorder, and share ordered problem playlists for a focused study session.";

export const metadata: Metadata = {
  title: "Playlists",
  description,
  alternates: {
    canonical: "/playlists",
  },
  openGraph: {
    title: "Playlists — DeepForge",
    description,
    url: "/playlists",
    type: "website",
    siteName: "DeepForge",
  },
};

export default function PlaylistsPage() {
  return (
    <PageShell
      title={SECTIONS_BY_ID.playlists.title}
      description={SECTIONS_BY_ID.playlists.blurb}
    >
      <Playlists />
    </PageShell>
  );
}
