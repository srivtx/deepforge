import type { Metadata } from "next";
import { PageShell } from "@/components/PageShell";
import { ReviewHub } from "@/components/review/ReviewHub";

const description =
  "A 14-day due forecast, trouble-spot triage, an interleaved cram drill, and an honest health summary built from your spaced-review schedule.";

export const metadata: Metadata = {
  title: "Review",
  description,
  alternates: {
    canonical: "/review",
  },
  openGraph: {
    title: "Review — DeepForge",
    description,
    url: "/review",
    type: "website",
    siteName: "DeepForge",
  },
};

export default function ReviewPage() {
  return (
    <PageShell title="Review" description={description}>
      <ReviewHub />
    </PageShell>
  );
}
