import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageShell } from "@/components/PageShell";
import {
  LedgerWorkspace,
  type BdlProblemPayload,
} from "@/components/ledger/LedgerWorkspace";
import { getProblemById } from "@/data/problems";
import { extractFuncName } from "@/lib/pyodideWorkerProtocol";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const problem = getProblemById(id);
  if (!problem) return { title: "Ledger problem not found" };

  const description = `Run the Behavioral Delta Ledger against "${problem.title}" — an opt-in practice view that reports how many hidden checks an edit changed. Counts only; never a grade, never part of review or certificates.`;
  return {
    title: `${problem.title} — Behavioral Delta Ledger`,
    description,
    alternates: {
      canonical: `/ledger/${problem.id}`,
    },
    openGraph: {
      title: `${problem.title} — Behavioral Delta Ledger — DeepForge`,
      description,
      url: `/ledger/${problem.id}`,
      type: "website",
      siteName: "DeepForge",
    },
    twitter: {
      card: "summary",
      title: `${problem.title} — Behavioral Delta Ledger — DeepForge`,
      description,
    },
  };
}

export default async function LedgerProblemPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const problem = getProblemById(id);
  if (!problem) notFound();

  const payload: BdlProblemPayload = {
    id: problem.id,
    title: problem.title,
    category: problem.category,
    difficulty: problem.difficulty,
    description: problem.description,
    starterCode: problem.starterCode,
    solution: problem.solution,
    testCases: problem.testCases,
  };
  const func = extractFuncName(problem.solution) ?? "";

  return (
    <PageShell>
      <LedgerWorkspace problem={payload} func={func} />
    </PageShell>
  );
}
