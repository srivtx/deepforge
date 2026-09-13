"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { ARTICLES, type Article } from "@/data/articles";
import { PROBLEMS } from "@/data/problems";
import { DEMOS } from "@/lib/articles-demos";

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

function ArticleReader({
  article,
  onClose,
  onNavigate,
}: {
  article: Article;
  onClose: () => void;
  onNavigate: (article: Article) => void;
}) {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const problemMap = useMemo(
    () => new Map(PROBLEMS.map((p) => [p.id, p])),
    [],
  );

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
  }, [article.id]);

  const index = ARTICLES.findIndex((a) => a.id === article.id);
  const next = index >= 0 && index < ARTICLES.length - 1 ? ARTICLES[index + 1] : null;
  const demoCount = article.sections.filter((s) => s.kind === "demo").length;

  return (
    <div
      ref={scrollRef}
      className="df-scroll min-h-0 flex-1 overflow-y-auto px-4 py-5 sm:px-8 sm:py-8"
    >
      <div className="mx-auto max-w-2xl">
        <button
          type="button"
          onClick={onClose}
          aria-label="Back to all articles"
          className="inline-flex items-center gap-1.5 rounded-lg border border-hairline px-3 py-1.5 text-xs text-body-mid transition-colors hover:bg-canvas-soft hover:text-ink"
        >
          <span aria-hidden>&larr;</span> Back
        </button>

        <div className="mt-6 flex flex-wrap items-center gap-2 text-xs">
          <span className="rounded-full border border-hairline px-2 py-0.5 text-[10px] font-medium text-body-mid">
            {article.category}
          </span>
          <span className="font-mono text-[10px] text-mute">
            {article.readMinutes} min read · {demoCount} interactive demo
            {demoCount === 1 ? "" : "s"}
          </span>
        </div>

        <h3 className="mt-3 text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
          {article.title}
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-body-mid">
          {article.dek}
        </p>

        <div className="mt-6">
          {article.sections.map((section, i) => {
            if (section.kind === "prose") {
              return <Paragraph key={`s-${i}`} text={section.text} index={i} />;
            }
            const Demo = DEMOS[section.demo];
            return (
              <div key={`s-${i}`} className="mt-6">
                <Demo params={section.params} />
              </div>
            );
          })}
        </div>

        <div className="mt-8 rounded-lg border border-hairline bg-canvas-card p-4 sm:p-5">
          <h4 className="text-sm font-semibold text-ink">Practice this</h4>
          <p className="mt-1 text-xs text-body-mid">
            Open a problem and implement the idea from scratch. Progress saves
            to this browser.
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
                  className="inline-flex max-w-full items-center gap-1.5 rounded-full border border-hairline bg-canvas px-2.5 py-1 text-xs text-body-mid transition-colors hover:border-accent/40 hover:bg-accent/5 hover:text-ink"
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

        <div className="mt-6 flex items-center justify-between gap-3 pb-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-hairline px-3 py-1.5 text-xs text-body-mid transition-colors hover:bg-canvas-soft hover:text-ink"
          >
            <span aria-hidden>&larr;</span> All articles
          </button>
          {next && (
            <button
              type="button"
              onClick={() => onNavigate(next)}
              className="max-w-[60%] rounded-lg bg-accent px-3.5 py-1.5 text-xs font-medium text-canvas transition-opacity hover:opacity-90"
            >
              Next: {next.title} <span aria-hidden>&rarr;</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export function Articles() {
  const [active, setActive] = useState<Article | null>(null);
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);

  // Escape closes the reader.
  useEffect(() => {
    if (!active) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setActive(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active]);

  // Focus the reader while it is open, lock background scroll, and hand
  // focus back to the card that opened it.
  useEffect(() => {
    if (!active) return;
    returnFocusRef.current =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    overlayRef.current?.focus();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
      returnFocusRef.current?.focus();
    };
  }, [active]);

  return (
    <>
      <section
        id="articles"
        className="mx-auto max-w-6xl scroll-mt-16 px-4 py-10 sm:px-6 sm:py-14"
      >
        <div className="mb-6">
          <h2 className="text-sm font-medium text-body-mid">
            {ARTICLES.length} lessons · every demo runs locally
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
          {ARTICLES.map((article) => {
            const demoCount = article.sections.filter(
              (s) => s.kind === "demo",
            ).length;
            return (
              <button
                key={article.id}
                type="button"
                onClick={() => setActive(article)}
                aria-label={`Read ${article.title}, ${article.readMinutes} minute read`}
                className="flex flex-col gap-3 rounded-lg border border-hairline bg-canvas-card p-4 text-left transition-colors hover:bg-canvas-soft sm:p-5"
              >
                <div className="flex items-start justify-between gap-3">
                  <span className="rounded-full border border-hairline px-2 py-0.5 text-[10px] font-medium text-body-mid">
                    {article.category}
                  </span>
                  <span className="shrink-0 font-mono text-[10px] text-mute">
                    {article.readMinutes} min
                  </span>
                </div>
                <h3 className="text-base font-semibold text-ink">
                  {article.title}
                </h3>
                <p className="text-sm leading-relaxed text-body">
                  {article.dek}
                </p>
                <span className="mt-auto pt-1 font-mono text-[10px] text-accent">
                  {demoCount} interactive demo{demoCount === 1 ? "" : "s"}{" "}
                  <span aria-hidden>&rarr;</span>
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {active && (
        <div
          ref={overlayRef}
          tabIndex={-1}
          className="df-fade-in fixed inset-0 z-40 flex items-center justify-center bg-canvas/80 p-3 backdrop-blur-sm outline-none sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-label={`Article: ${active.title}`}
        >
          <div className="flex max-h-full w-full max-w-3xl flex-col overflow-hidden rounded-lg border border-hairline bg-canvas">
            <div className="flex shrink-0 items-center justify-between gap-4 border-b border-hairline px-4 py-3 sm:px-6">
              <div className="min-w-0">
                <p className="text-xs font-medium text-body-mid">Article</p>
                <h3 className="truncate text-sm font-semibold text-ink">
                  {active.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setActive(null)}
                className="shrink-0 rounded-lg border border-hairline px-3 py-1.5 text-xs text-body-mid transition-colors hover:bg-canvas-soft hover:text-ink"
              >
                Close
              </button>
            </div>
            <ArticleReader
              article={active}
              onClose={() => setActive(null)}
              onNavigate={setActive}
            />
          </div>
        </div>
      )}
    </>
  );
}
