import Link from "next/link";
import { INVENTIONS } from "@/data/inventions";
import type { InventionPaper } from "@/data/inventions";
import {
  CLAIM_CONVENTION,
  METHODS,
  PLANNED_WORK,
  PORTFOLIO_LIMITATIONS,
  REPRO_COMMANDS,
  REPRO_LIMITS,
  RESEARCH_AGENDA,
  RESEARCH_QUESTIONS,
  RESEARCH_SUMMARY,
  REVIEW_LABEL,
  REVIEW_STATEMENT,
  SCALE,
  STATUS_LEGEND,
  WORKS,
  claimLabel,
  statusLabel,
  workShortTitle,
  workTitle,
  type Claim,
  type ClaimKind,
  type WorkEntry,
} from "@/data/researchOverview";

/**
 * The research front: a concise overview of the programme, the three research
 * questions, the works with their status and their claims split into results
 * and hypotheses, the methods with their boundaries, the empirical scale, how to
 * reproduce it, and the limits.
 *
 * Presentation only. Every string comes from `src/data/researchOverview.ts`, so
 * the prose, the status vocabulary, and the tests cannot disagree.
 *
 * Design notes, all from `docs/DESIGN-SYSTEM.md`:
 * - one `<h1>` (from `PageShell`); section headings descend h2 then h3.
 * - the only two marks on the page are the evidence convention (accent for a
 *   measured result, hairline for a hypothesis) and the review state (warning),
 *   which is what the token table reserves state colours for.
 * - pills reuse the keyword-pill and callout-pill shapes already in the codebase;
 *   cards are `rounded-lg border border-hairline bg-canvas-card`; spacing is the
 *   standard scale; nothing animates.
 */

/**
 * One page container with one rhythm, and a single gap between sections. The
 * design system forbids stacking two `py-12+` blocks, so the sections inside the
 * page are spaced with the standard `gap-8` rather than each carrying its own
 * page padding.
 */
const PAGE = "mx-auto w-full max-w-6xl px-4 pb-10 sm:px-6 sm:pb-14";
const RHYTHM = "flex flex-col gap-8";

const CARD = "rounded-lg border border-hairline bg-canvas-card p-4 sm:p-5";

/** Evidence convention: accent for measured, hairline for not yet measured. */
const CLAIM_MARK: Record<ClaimKind, string> = {
  result:
    "shrink-0 rounded-full border border-accent/40 bg-accent/5 px-2 py-0.5 text-xs font-medium text-accent",
  hypothesis:
    "shrink-0 rounded-full border border-hairline bg-canvas-soft px-2 py-0.5 text-xs font-medium text-body-mid",
};

const CLAIM_TEXT: Record<ClaimKind, string> = {
  result: "text-sm leading-relaxed text-body",
  hypothesis: "text-sm leading-relaxed text-body-mid",
};

/** The keyword-pill shape already used for paper keywords, reused verbatim. */
const KIND_PILL =
  "shrink-0 rounded-full border border-hairline px-2 py-0.5 text-xs text-body-mid";

/** The review state is a state, so it wears the state colour. */
const REVIEW_PILL =
  "shrink-0 rounded-full border border-warning/40 bg-warning/5 px-2 py-0.5 text-xs font-medium text-warning";

const PRIMARY_LINK =
  "inline-flex min-h-11 items-center gap-1.5 rounded-lg border border-accent/40 bg-accent/5 px-3.5 py-1.5 text-sm font-medium text-accent transition-colors hover:bg-accent/10 focus:outline-none focus-visible:ring-1 focus-visible:ring-accent/40 sm:min-h-0";

const SECONDARY_LINK =
  "inline-flex min-h-11 items-center gap-1.5 rounded-lg border border-hairline px-3.5 py-1.5 text-sm text-body transition-colors hover:border-accent/40 hover:text-ink focus:outline-none focus-visible:ring-1 focus-visible:ring-accent/40 sm:min-h-0";

const PAPER_BY_SLUG: Record<string, InventionPaper> = INVENTIONS.reduce<
  Record<string, InventionPaper>
>((acc, paper) => {
  acc[paper.slug] = paper;
  return acc;
}, {});

/* ─────────────────────────── primitives ─────────────────────────────── */

function Section({
  id,
  title,
  lead,
  children,
}: {
  id: string;
  title: string;
  lead?: string;
  children: React.ReactNode;
}) {
  return (
    <section aria-labelledby={`${id}-title`}>
      <h2 id={`${id}-title`} className="text-lg font-semibold tracking-tight text-ink">
        {title}
      </h2>
      {lead ? (
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-body-mid">{lead}</p>
      ) : null}
      <div className="mt-4 flex flex-col gap-3">{children}</div>
    </section>
  );
}

function ReviewPill() {
  return (
    <li>
      <span className={REVIEW_PILL}>{REVIEW_LABEL}</span>
    </li>
  );
}

function KindPills({ work }: { work: WorkEntry }) {
  return (
    <ul aria-label="Publication status" className="flex flex-wrap items-center gap-2">
      {work.kinds.map((kind) => (
        <li key={kind}>
          <span className={KIND_PILL}>{statusLabel(kind)}</span>
        </li>
      ))}
      <ReviewPill />
    </ul>
  );
}

function ClaimList({ claims }: { claims: readonly Claim[] }) {
  return (
    <ul className="mt-4 flex flex-col gap-2.5">
      {claims.map((claim) => (
        <li key={claim.text} className="flex items-start gap-2.5">
          <span className={CLAIM_MARK[claim.kind]}>
            {claimLabel(claim.kind)}
          </span>
          <span className={`min-w-0 ${CLAIM_TEXT[claim.kind]}`}>{claim.text}</span>
        </li>
      ))}
    </ul>
  );
}

function WorkCard({ work }: { work: WorkEntry }) {
  const paper = PAPER_BY_SLUG[work.slug];
  return (
    <article className={CARD}>
      <KindPills work={work} />
      <h3 className="mt-3 text-base font-semibold tracking-tight text-ink">
        <Link
          href={`/inventions/${work.slug}`}
          className="rounded-sm transition-colors hover:text-accent focus:outline-none focus-visible:ring-1 focus-visible:ring-accent/40"
        >
          {workTitle(work.slug)}
        </Link>
      </h3>
      {paper ? (
        <p className="mt-1.5 font-mono text-[11px] text-mute">
          {paper.date} · {paper.authors.join(", ")}
        </p>
      ) : null}
      <p className="mt-2 text-sm leading-relaxed text-body-mid">{work.note}</p>
      <ClaimList claims={work.established} />
      <ClaimList claims={work.hypotheses} />
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <Link href={`/inventions/${work.slug}`} className={PRIMARY_LINK}>
          Read the paper <span aria-hidden>&rarr;</span>
        </Link>
        <a href={`/inventions/${work.slug}/paper.pdf`} className={SECONDARY_LINK}>
          PDF
        </a>
      </div>
    </article>
  );
}

/* ───────────────────────────── overview ─────────────────────────────── */

function Overview() {
  return (
    <section aria-labelledby="overview-title">
      <div className="rounded-lg border border-accent/40 bg-accent/5 p-4 sm:p-5">
        <h2
          id="overview-title"
          className="text-lg font-semibold tracking-tight text-ink"
        >
          Research overview
        </h2>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-body">
          {RESEARCH_AGENDA}
        </p>
        {RESEARCH_SUMMARY.map((paragraph) => (
          <p
            key={paragraph}
            className="mt-2 max-w-3xl text-sm leading-relaxed text-body-mid"
          >
            {paragraph}
          </p>
        ))}
        <p className="mt-3 border-t border-hairline pt-3 text-sm font-medium leading-relaxed text-warning">
          {REVIEW_STATEMENT}
        </p>
      </div>
    </section>
  );
}

function Legend() {
  return (
    <section aria-labelledby="legend-title">
      <div className={CARD}>
        <h2 id="legend-title" className="text-sm font-medium text-ink">
          How to read this page
        </h2>
        <p className="mt-2 max-w-3xl text-xs leading-relaxed text-body-mid">
          Two conventions are used on every claim below. The first separates
          what was measured from what was not. The second states what kind of
          object each work is and whether it has been reviewed. Nothing on this
          page is a result unless it is marked{" "}
          <span className="text-accent">Result</span>.
        </p>

        <h3 className="mt-4 text-sm font-medium text-ink">Evidence</h3>
        <ul className="mt-2 flex flex-col gap-2.5">
          {CLAIM_CONVENTION.map((entry) => (
            <li key={entry.kind} className="flex items-start gap-2.5">
              <span className={CLAIM_MARK[entry.kind]}>{entry.label}</span>
              <span className="min-w-0 text-xs leading-relaxed text-body-mid">
                {entry.definition}
              </span>
            </li>
          ))}
        </ul>

        <h3 className="mt-4 text-sm font-medium text-ink">Status</h3>
        <ul className="mt-2 flex flex-col gap-2.5">
          <li className="flex items-start gap-2.5">
            <span className={REVIEW_PILL}>{REVIEW_LABEL}</span>
            <span className="min-w-0 text-xs leading-relaxed text-body-mid">
              Carried by every work in this portfolio. Nothing here has been
              submitted to a venue or accepted by one.
            </span>
          </li>
          {STATUS_LEGEND.map((entry) => (
            <li key={entry.kind} className="flex items-start gap-2.5">
              <span className={KIND_PILL}>{entry.label}</span>
              <span className="min-w-0 text-xs leading-relaxed text-body-mid">
                {entry.definition}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function Questions() {
  return (
    <Section
      id="questions"
      title="Research questions"
      lead="Three questions carry the programme. Each has a practice surface built from it and a paper that measures it."
    >
      <div className="grid gap-3 md:grid-cols-3">
        {RESEARCH_QUESTIONS.map((thread) => (
          <article key={thread.id} className={CARD}>
            <h3 className="text-sm font-medium text-ink">{thread.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-body">{thread.question}</p>
            <p className="mt-2 text-xs leading-relaxed text-body-mid">
              {thread.detail}
            </p>
            <p className="mt-3 font-mono text-[11px] text-mute">
              {workShortTitle(thread.paper)}
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <Link
                href={thread.href}
                className="inline-flex min-h-11 items-center gap-1.5 text-sm font-medium text-accent transition-colors hover:text-ink focus:outline-none focus-visible:ring-1 focus-visible:ring-accent/40 sm:min-h-0"
              >
                {thread.action} <span aria-hidden>&rarr;</span>
              </Link>
              <Link
                href={`/inventions/${thread.paper}`}
                className="inline-flex min-h-11 items-center gap-1.5 text-sm text-body-mid transition-colors hover:text-ink focus:outline-none focus-visible:ring-1 focus-visible:ring-accent/40 sm:min-h-0"
              >
                Read the paper
              </Link>
            </div>
          </article>
        ))}
      </div>
    </Section>
  );
}

/* ───────────────────────────── the works ────────────────────────────── */

function Works() {
  const flagship = WORKS.filter((work) => work.role === "flagship");
  const supporting = WORKS.filter((work) => work.role === "supporting");

  return (
    <>
      <Section
        id="flagship"
        title="Flagship studies"
        lead="The three papers that answer the three questions. Each states what it measured and what it did not measure."
      >
        {flagship.map((work) => (
          <WorkCard key={work.slug} work={work} />
        ))}
      </Section>
      <Section
        id="supporting"
        title="Supporting work"
        lead="Three further papers. Two concern reproducibility of computation rather than programming education, and are recorded as specification and artifact contributions rather than as new methods."
      >
        {supporting.map((work) => (
          <WorkCard key={work.slug} work={work} />
        ))}
      </Section>
    </>
  );
}

/* ─────────────────────── methods, scale, repro ─────────────────────── */

function Methods() {
  return (
    <Section
      id="methods"
      title="Methods"
      lead="Each method is stated with what it can do and what it cannot, because the boundary is part of the result."
    >
      {METHODS.map((method) => (
        <article key={method.id} className={CARD}>
          <h3 className="text-sm font-medium text-ink">{method.name}</h3>
          <p className="mt-2 text-sm leading-relaxed text-body">{method.does}</p>
          <p className="mt-2 text-sm leading-relaxed text-body-mid">{method.cannot}</p>
          <p className="mt-3 font-mono text-[11px] text-mute">
            {method.works.map((slug) => workShortTitle(slug)).join(" · ")}
          </p>
        </article>
      ))}
    </Section>
  );
}

function Scale() {
  return (
    <Section
      id="scale"
      title="Empirical scale"
      lead="The size of the evidence behind each paper. Every figure appears in the paper it is attributed to, and each is recomputed by a gate under reproducibility."
    >
      <ul className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {SCALE.map((entry) => (
          <li key={`${entry.paper}-${entry.value}`} className={CARD}>
            <p className="font-mono text-xl font-medium tracking-tight text-ink">
              {entry.value}
            </p>
            <p className="mt-1 text-xs leading-relaxed text-body">{entry.label}</p>
            <Link
              href={`/inventions/${entry.paper}`}
              className="mt-2 inline-block font-mono text-[11px] text-mute underline-offset-2 transition-colors hover:text-accent focus:outline-none focus-visible:ring-1 focus-visible:ring-accent/40"
            >
              {workShortTitle(entry.paper)}
            </Link>
          </li>
        ))}
      </ul>
    </Section>
  );
}

function Reproducibility() {
  return (
    <Section
      id="reproducibility"
      title="Reproducibility"
      lead="Every command below runs in continuous integration and fails the build when a pinned result drifts."
    >
      <div className={CARD}>
        <ul className="df-scroll flex flex-col gap-2 overflow-x-auto">
          {REPRO_COMMANDS.map((entry) => (
            <li
              key={entry.command}
              className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:gap-4"
            >
              <code className="shrink-0 font-mono text-xs text-accent">
                {entry.command}
              </code>
              <span className="min-w-0 text-xs leading-relaxed text-body-mid">
                {entry.what}
              </span>
            </li>
          ))}
        </ul>
      </div>
      <div className={CARD}>
        <h3 className="text-sm font-medium text-ink">What reproduction does not mean here</h3>
        <ul className="mt-2 flex list-disc flex-col gap-1.5 pl-4 text-sm leading-relaxed text-body-mid">
          {REPRO_LIMITS.map((limit) => (
            <li key={limit}>{limit}</li>
          ))}
        </ul>
      </div>
    </Section>
  );
}

function Limits() {
  return (
    <Section
      id="limitations"
      title="Limitations"
      lead="These apply to the whole portfolio, not to one paper, and they are listed before any claim is read as a general result."
    >
      <div className={CARD}>
        <ul className="flex list-disc flex-col gap-1.5 pl-4 text-sm leading-relaxed text-body">
          {PORTFOLIO_LIMITATIONS.map((limit) => (
            <li key={limit}>{limit}</li>
          ))}
        </ul>
      </div>
    </Section>
  );
}

function Planned() {
  return (
    <Section
      id="planned"
      title="Planned work"
      lead="Nothing on this list has been run. Each item is a question the portfolio cannot yet answer, recorded so the gap is visible rather than implied."
    >
      {PLANNED_WORK.map((item) => (
        <article key={item.id} className={CARD}>
          <ul className="flex flex-wrap items-center gap-2">
            {item.kinds.map((kind) => (
              <li key={kind}>
                <span className={KIND_PILL}>{statusLabel(kind)}</span>
              </li>
            ))}
            <li>
              <span className={REVIEW_PILL}>{REVIEW_LABEL}</span>
            </li>
          </ul>
          <h3 className="mt-3 text-sm font-medium text-ink">{item.title}</h3>
          <p className="mt-2 text-sm leading-relaxed text-body">{item.question}</p>
          <p className="mt-2 text-sm leading-relaxed text-body-mid">{item.state}</p>
        </article>
      ))}
    </Section>
  );
}

/* ─────────────────────────────── page ───────────────────────────────── */

export function ResearchOverview() {
  return (
    <div className={PAGE}>
      <div className={RHYTHM}>
        <Overview />
        <Legend />
        <Questions />
        <Works />
        <Methods />
        <Scale />
        <Reproducibility />
        <Limits />
        <Planned />
      </div>
    </div>
  );
}
