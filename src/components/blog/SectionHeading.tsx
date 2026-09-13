import type { ReactNode } from "react";

export function SectionHeading({
  n,
  id,
  children,
}: {
  n?: number;
  id?: string;
  children: ReactNode;
}) {
  return (
    <h2
      id={id}
      className="scroll-mt-16 pt-4 text-lg font-semibold tracking-tight text-ink"
    >
      {typeof n === "number" && (
        <span className="mr-2 font-mono text-sm text-accent">{n}.</span>
      )}
      {children}
    </h2>
  );
}
