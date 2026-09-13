import type { ReactNode } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export function BlogProse({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "max-w-3xl space-y-5 text-sm leading-relaxed text-body",
        "[&_p_code]:rounded [&_p_code]:bg-canvas-soft [&_p_code]:px-1 [&_p_code]:py-0.5 [&_p_code]:font-mono [&_p_code]:text-[12px] [&_p_code]:text-accent",
        "[&_li_code]:rounded [&_li_code]:bg-canvas-soft [&_li_code]:px-1 [&_li_code]:py-0.5 [&_li_code]:font-mono [&_li_code]:text-[12px] [&_li_code]:text-accent",
        "[&_strong]:font-medium [&_strong]:text-ink",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function BlogLink({
  href,
  children,
  className,
}: {
  href: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "rounded-sm font-medium text-accent underline decoration-accent/30 underline-offset-2 transition-colors hover:decoration-accent focus:outline-none focus-visible:ring-1 focus-visible:ring-accent/40",
        className,
      )}
    >
      {children}
    </Link>
  );
}
