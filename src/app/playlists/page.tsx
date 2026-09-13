import type { Metadata } from "next";
import { Playlists } from "@/components/Playlists";
import { SectionShell } from "@/components/SectionShell";

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
    <SectionShell>
      <Playlists />
    </SectionShell>
  );
}
