import type { Metadata } from "next";
import { ProgressBackup } from "@/components/ProgressBackup";
import { SectionShell } from "@/components/SectionShell";

const description =
  "Export a backup of your DeepForge data or move your progress to another device with a single file.";

export const metadata: Metadata = {
  title: "Back up your progress",
  description,
  alternates: {
    canonical: "/backup",
  },
  openGraph: {
    title: "Back up your progress — DeepForge",
    description,
    url: "/backup",
    type: "website",
    siteName: "DeepForge",
  },
};

export default function BackupPage() {
  return (
    <SectionShell>
      <ProgressBackup />
    </SectionShell>
  );
}
