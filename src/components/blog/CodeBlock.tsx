import { cn } from "@/lib/utils";

export function CodeBlock({
  code,
  language = "Python",
  title,
  className,
}: {
  code: string;
  language?: string;
  title?: string;
  className?: string;
}) {
  return (
    <figure
      className={cn(
        "overflow-hidden rounded-lg border border-hairline bg-canvas-card",
        className,
      )}
    >
      <figcaption className="flex items-center justify-between gap-3 border-b border-hairline px-4 py-2">
        <span className="truncate text-xs font-medium text-body-mid">
          {title ?? language}
        </span>
        {title && (
          <span className="shrink-0 font-mono text-[10px] text-mute">
            {language}
          </span>
        )}
      </figcaption>
      <pre className="df-scroll overflow-x-auto p-4 font-mono text-[13px] leading-relaxed text-body">
        <code>{code}</code>
      </pre>
    </figure>
  );
}
