import type { BlogPost } from "@/data/blog/types";
import { cn } from "@/lib/utils";

const DATE_FORMAT = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
  timeZone: "UTC",
});

export function formatPostDate(date: string): string {
  const parsed = new Date(`${date}T00:00:00.000Z`);
  if (Number.isNaN(parsed.getTime())) return date;
  return DATE_FORMAT.format(parsed);
}

export function PostMeta({
  post,
  className,
}: {
  post: BlogPost;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-x-3 gap-y-2 text-xs text-body-mid",
        className,
      )}
    >
      <time
        dateTime={post.date}
        className="font-mono text-[11px] text-mute"
      >
        {formatPostDate(post.date)}
      </time>
      <span aria-hidden className="text-mute">
        &middot;
      </span>
      <span className="font-mono text-[11px] text-mute">
        {post.readingMinutes} min read
      </span>
      {post.tags.length > 0 && (
        <>
          <span aria-hidden className="text-mute">
            &middot;
          </span>
          <ul className="flex flex-wrap items-center gap-1.5">
            {post.tags.map((tag) => (
              <li key={tag}>
                <span className="rounded-full border border-hairline bg-canvas-card px-2 py-0.5 text-[10px] font-medium text-body-mid">
                  {tag}
                </span>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
