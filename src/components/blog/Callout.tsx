import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export type CalloutVariant = "info" | "decision" | "tradeoff";

const VARIANTS: Record<
  CalloutVariant,
  { bar: string; title: string; label: string }
> = {
  info: { bar: "border-l-info", title: "text-info", label: "Note" },
  decision: { bar: "border-l-accent", title: "text-accent", label: "Decision" },
  tradeoff: {
    bar: "border-l-warning",
    title: "text-warning",
    label: "Tradeoff",
  },
};

export function Callout({
  variant = "info",
  title,
  children,
}: {
  variant?: CalloutVariant;
  title?: string;
  children: ReactNode;
}) {
  const style = VARIANTS[variant];
  return (
    <aside
      className={cn(
        "rounded-lg border border-l-2 border-hairline bg-canvas-card px-4 py-3.5 sm:px-5",
        style.bar,
      )}
    >
      <p className={cn("text-xs font-medium", style.title)}>
        {title ?? style.label}
      </p>
      <div className="mt-1.5 space-y-2 text-sm leading-relaxed text-body">
        {children}
      </div>
    </aside>
  );
}
