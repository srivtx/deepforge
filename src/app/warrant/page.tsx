import type { Metadata } from "next";
import Link from "next/link";
import { PageShell } from "@/components/PageShell";
import { WarrantLab } from "@/components/warrant/WarrantLab";

const TITLE = "Warrant Lab";
const DESCRIPTION =
  "A hands-on demo of one idea: content that was derived for you (a hint, an explanation, a difficulty label, a prerequisite link) also carries the list of checks run against it. Challenge a claim, watch exactly what happens to its grade, and audit the bookkeeping. Everything happens in your browser and nothing is stored or sent.";

export const metadata: Metadata = {
  title: "Warrant Lab — DeepForge",
  description: DESCRIPTION,
  alternates: {
    canonical: "/warrant",
  },
  openGraph: {
    title: "Warrant Lab — DeepForge",
    description: DESCRIPTION,
    url: "/warrant",
    type: "website",
    siteName: "DeepForge",
  },
  twitter: {
    card: "summary",
    title: "Warrant Lab — DeepForge",
    description: DESCRIPTION,
  },
};

const START_HERE: readonly string[] = [
  "Find Hint · hint-000 below and press \"Why this grade?\" — you will see the three check-families it survived and the arithmetic that turns them into a grade of 3.",
  "Find Difficulty · difficulty-002 (no checks yet). Press \"Log a survival check\": its grade moves from 0 to 1, because one declared check-family survived.",
  "Find Explanation · explanation-001 and press \"Log a refutation\". It goes dead, and the blast radius shows exactly the two claims that cited it (Prerequisite · prerequisite-004 and Hint · hint-008) dying with it — and nothing else.",
];

const GLOSSARY: readonly { readonly term: string; readonly meaning: string }[] = [
  {
    term: "Claim",
    meaning:
      "One piece of content someone else derived for you: a hint, an explanation, a difficulty label, or a prerequisite link. Each card below is one claim.",
  },
  {
    term: "Ledger",
    meaning:
      "The append-only list of checks run against that claim. Checks are never deleted or edited, only added; a locally added check lives in this browser tab only.",
  },
  {
    term: "Check-family",
    meaning:
      "A kind of check. Two checks count as one family when they share a declared family, or when their declared coverage overlaps by at least half. Families are declared, not proven, so two checks that share a blind spot can still count as two.",
  },
  {
    term: "Grade γ",
    meaning:
      "The capped count of surviving check-families (3 at most), dragged down to the lowest grade of anything the claim cites. If a check refutes the claim, the grade becomes \"dead\", permanently.",
  },
  {
    term: "Exact demotion",
    meaning:
      "Refute a claim and exactly the claims that cite it — directly or through a chain — die with it; independent claims keep their grades.",
  },
  {
    term: "Audit",
    meaning:
      "Redoes the grade arithmetic from the ledger and checks the stored link chain against a frozen head anchor. It proves the bookkeeping is consistent, not that the content is right.",
  },
];

export default function WarrantPage() {
  return (
    <PageShell title={TITLE} description={DESCRIPTION}>
      <section
        aria-label="Start here"
        className="mx-auto w-full max-w-6xl px-4 pb-4 pt-2 sm:px-6 sm:pb-6 sm:pt-4"
      >
        <div className="rounded-lg border border-accent/40 bg-accent/5 p-4 sm:p-5">
          <h2 className="text-sm font-medium text-ink">Start here: a three-press tour</h2>
          <ol className="mt-2 flex list-decimal flex-col gap-1.5 pl-4 text-xs leading-relaxed text-body">
            {START_HERE.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ol>
          <p className="mt-2 text-[11px] leading-snug text-body-mid">
            The buttons only change this browser tab. Refresh the page and the
            frozen demo claims are back.
          </p>
        </div>
      </section>
      <WarrantLab />
      <section
        aria-label="What the words mean"
        className="mx-auto w-full max-w-6xl px-4 pb-12 sm:px-6 sm:pb-16"
      >
        <div className="rounded-lg border border-hairline bg-canvas-card p-4 sm:p-5">
          <h2 className="text-sm font-medium text-ink">What the words mean</h2>
          <dl className="mt-2 flex flex-col gap-2">
            {GLOSSARY.map((entry) => (
              <div key={entry.term}>
                <dt className="text-xs font-medium text-ink">{entry.term}</dt>
                <dd className="text-xs leading-relaxed text-body-mid">{entry.meaning}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-3 text-xs leading-relaxed text-body-mid">
            Two honest disclaimers: an empty ledger means nobody has tried a
            check yet, not that the claim passed, and the audit checks the
            bookkeeping only — never whether a claim is true. This lab belongs
            to the{" "}
            <Link
              href="/inventions"
              className="text-accent underline-offset-2 hover:underline focus:outline-none focus-visible:ring-1 focus-visible:ring-accent/40"
            >
              inventions index
            </Link>
            , where the refutation-ledger paper and the other labs are listed.
          </p>
        </div>
      </section>
    </PageShell>
  );
}
