import type { ReactNode } from "react";

export function Footnote({ n }: { n: number }) {
  return (
    <sup className="ml-0.5 font-mono text-[10px] leading-none">
      <a
        href={`#fn-${n}`}
        aria-label={`Footnote ${n}`}
        className="rounded-sm text-accent transition-colors hover:text-ink focus:outline-none focus-visible:ring-1 focus-visible:ring-accent/40"
      >
        [{n}]
      </a>
    </sup>
  );
}

export function References({
  children,
  title = "References",
}: {
  children: ReactNode;
  title?: string;
}) {
  return (
    <section
      aria-label={title}
      className="mt-10 border-t border-hairline pt-6"
    >
      <h2 className="text-sm font-semibold tracking-tight text-ink">{title}</h2>
      <ol className="mt-3 list-decimal space-y-2 pl-5 text-xs leading-relaxed text-body-mid">
        {children}
      </ol>
    </section>
  );
}

export function ReferenceItem({
  n,
  href,
  children,
}: {
  n: number;
  href?: string;
  children: ReactNode;
}) {
  return (
    <li id={`fn-${n}`} className="scroll-mt-16">
      {href ? (
        <a
          href={href}
          className="rounded-sm text-body transition-colors hover:text-ink focus:outline-none focus-visible:ring-1 focus-visible:ring-accent/40"
        >
          {children}
        </a>
      ) : (
        children
      )}
    </li>
  );
}
