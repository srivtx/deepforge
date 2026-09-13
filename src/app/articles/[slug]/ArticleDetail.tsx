"use client";

import { useMemo, type ReactNode } from "react";
import Link from "next/link";
import { FIGURES, type Article } from "@/data/articles";
import { PROBLEM_META } from "@/data/problems/problem-meta";
import { DEMOS } from "@/lib/articles-demos";

interface ArticleDetailProps {
  article: Article;
  prev: Article | null;
  next: Article | null;
}

function renderInline(text: string, keyPrefix: string): ReactNode[] {
  return text.split("`").map((part, i) =>
    i % 2 === 1 ? (
      <code
        key={`${keyPrefix}-code-${i}`}
        className="rounded bg-canvas-soft px-1 py-0.5 font-mono text-[12px] text-accent"
      >
        {part}
      </code>
    ) : (
      <span key={`${keyPrefix}-text-${i}`}>{part}</span>
    ),
  );
}

function Paragraph({ text, index }: { text: string; index: number }) {
  return (
    <>
      {text.split("\n\n").map((paragraph, i) => (
        <p
          key={`p-${index}-${i}`}
          className="mt-4 text-sm leading-relaxed text-body"
        >
          {renderInline(paragraph, `p-${index}-${i}`)}
        </p>
      ))}
    </>
  );
}

const navLink =
  "group flex min-w-0 flex-col rounded-lg border border-hairline bg-canvas-card px-4 py-3 transition-colors hover:border-accent/40 focus:outline-none focus-visible:ring-1 focus-visible:ring-accent/40 sm:max-w-[48%]";

export function ArticleDetail({ article, prev, next }: ArticleDetailProps) {
  const problemMap = useMemo(
    () => new Map(PROBLEM_META.map((p) => [p.id, p])),
    [],
  );
  const demoCount = article.sections.filter((s) => s.kind === "demo").length;

  return (
    <article className="mx-auto flex w-full max-w-3xl flex-col gap-8">
      <header className="flex flex-col gap-3">
        <Link
          href="/articles"
          className="inline-flex min-h-11 w-fit items-center gap-1.5 rounded-sm text-sm text-body-mid transition-colors hover:text-ink focus:outline-none focus-visible:ring-1 focus-visible:ring-accent/40 sm:min-h-0"
        >
          <span aria-hidden>&larr;</span> All articles
        </Link>
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="rounded-full border border-hairline px-2 py-0.5 text-[10px] font-medium text-body-mid">
            {article.category}
          </span>
          <span className="font-mono text-[10px] text-mute">
            {article.readMinutes} min read · {demoCount} interactive demo
            {demoCount === 1 ? "" : "s"}
          </span>
        </div>
        <h1 className="text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
          {article.title}
        </h1>
        <p className="text-sm leading-relaxed text-body-mid">{article.dek}</p>
      </header>

      <div>
        {article.sections.map((section, i) => {
          if (section.kind === "prose") {
            return <Paragraph key={`s-${i}`} text={section.text} index={i} />;
          }
          if (section.kind === "figure") {
            const Figure = FIGURES[section.figure];
            return (
              <figure key={`s-${i}`} className="my-8">
                <div className="overflow-hidden rounded-lg border border-hairline bg-canvas-card p-4 sm:p-5">
                  <Figure />
                </div>
                {section.caption && (
                  <figcaption className="mt-3 text-center text-xs text-body-mid">
                    {renderInline(section.caption, `fig-${i}`)}
                  </figcaption>
                )}
              </figure>
            );
          }
          const Demo = DEMOS[section.demo];
          return (
            <div key={`s-${i}`} className="my-8">
              <Demo params={section.params} />
            </div>
          );
        })}
      </div>

      <div className="rounded-lg border border-hairline bg-canvas-card p-4 sm:p-5">
        <h2 className="text-sm font-semibold text-ink">Practice this</h2>
        <p className="mt-1 text-xs text-body-mid">
          Open a problem and implement the idea from scratch. Progress saves to
          this browser.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {article.problemIds.map((id) => {
            const problem = problemMap.get(id);
            return (
              <button
                key={id}
                type="button"
                onClick={() =>
                  window.dispatchEvent(
                    new CustomEvent("deepforge:open-problem", {
                      detail: { id },
                    }),
                  )
                }
                aria-label={`Open problem ${id}${problem ? `: ${problem.title}` : ""}`}
                className="inline-flex min-h-11 max-w-full items-center gap-1.5 rounded-full border border-hairline bg-canvas px-2.5 py-1 text-xs text-body-mid transition-colors hover:border-accent/40 hover:bg-accent/5 hover:text-ink focus:outline-none focus-visible:ring-1 focus-visible:ring-accent/40 sm:min-h-0"
              >
                <span className="font-mono text-[10px] text-accent">
                  #{id}
                </span>
                {problem && (
                  <span className="min-w-0 truncate">{problem.title}</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <nav
        aria-label="Article navigation"
        className="flex flex-col gap-2 border-t border-hairline pt-4 sm:flex-row sm:items-center sm:justify-between"
      >
        {prev ? (
          <Link href={`/articles/${prev.slug}`} className={navLink}>
            <span className="text-[11px] text-mute">Previous article</span>
            <span className="truncate text-sm font-medium text-ink group-hover:text-accent">
              {prev.title}
            </span>
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link
            href={`/articles/${next.slug}`}
            className={`${navLink} sm:items-end sm:text-right`}
          >
            <span className="text-[11px] text-mute">Next article</span>
            <span className="truncate text-sm font-medium text-ink group-hover:text-accent">
              {next.title}
            </span>
          </Link>
        ) : (
          <span />
        )}
      </nav>

      <footer className="border-t border-hairline pt-4 text-xs text-body-mid">
        <Link
          href="/articles"
          className="rounded-sm transition-colors hover:text-ink focus:outline-none focus-visible:ring-1 focus-visible:ring-accent/40"
        >
          All articles
        </Link>
        <span aria-hidden className="px-2 text-mute">
          ·
        </span>
        <Link
          href="/"
          className="rounded-sm transition-colors hover:text-ink focus:outline-none focus-visible:ring-1 focus-visible:ring-accent/40"
        >
          DeepForge home
        </Link>
      </footer>
    </article>
  );
}
