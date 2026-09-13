import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Figure({
  children,
  caption,
  label,
  className,
}: {
  children: ReactNode;
  caption: ReactNode;
  label?: string;
  className?: string;
}) {
  return (
    <figure className={cn("my-8", className)}>
      <div className="overflow-hidden rounded-lg border border-hairline bg-canvas-card p-4 sm:p-6">
        {children}
      </div>
      <figcaption className="mt-3 text-center text-xs text-body-mid">
        {label && (
          <span className="mr-1.5 font-mono text-[11px] text-mute">
            {label}
          </span>
        )}
        {caption}
      </figcaption>
    </figure>
  );
}
