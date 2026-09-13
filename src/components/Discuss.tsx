"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import {
  FORUM_CATEGORIES,
  FORUM_CHANGE_EVENT,
  formatRelativeTime,
  getForumSnapshot,
  seedForum,
  type ForumCategory,
  type ForumSnapshot,
  type ForumThread,
} from "@/lib/comments";
import { getAuthEmail, isSupabaseConfigured, onAuthChange } from "@/lib/auth";
import { getUserName } from "@/lib/leaderboard";
import {
  createReply,
  createThread,
  deleteThread,
  listReplies,
  listThreads,
  subscribe as subscribeSocial,
  toggleReplyUpvote,
  toggleThreadUpvote,
  type SocialResult,
} from "@/lib/sync/social";
import { cn } from "@/lib/utils";

interface DiscussProps {
  problemId?: string;
}

const EMPTY_FORUM: ForumSnapshot = {
  threads: [],
  replies: [],
  upvotedThreadIds: [],
  upvotedReplyIds: [],
};

let forumCache: ForumSnapshot | null = null;

function getClientForumSnapshot(): ForumSnapshot {
  seedForum();
  if (!forumCache) forumCache = getForumSnapshot();
  return forumCache;
}

function getServerForumSnapshot(): ForumSnapshot {
  return EMPTY_FORUM;
}

function subscribeForum(onStoreChange: () => void): () => void {
  const onChange = () => {
    forumCache = null;
    onStoreChange();
  };
  window.addEventListener(FORUM_CHANGE_EVENT, onChange);
  return () => window.removeEventListener(FORUM_CHANGE_EVENT, onChange);
}

type SocialTask<T> = Promise<SocialResult<T>>;

function useGlobalForumHint(): boolean {
  const [show, setShow] = useState(false);
  useEffect(() => {
    if (!isSupabaseConfigured()) return;
    const update = (email: string | null) => setShow(email === null);
    update(getAuthEmail());
    return onAuthChange(update);
  }, []);
  return show;
}

function useSocialSync(): {
  notice: string | null;
  run: <T,>(task: SocialTask<T>, onData?: (data: T) => void) => void;
} {
  const [notice, setNotice] = useState<string | null>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const run = useCallback(
    <T,>(task: SocialTask<T>, onData?: (data: T) => void) => {
      void task
        .then((result) => {
          if (!mountedRef.current) return;
          setNotice(result.error);
          if (result.data != null && onData) onData(result.data);
        })
        .catch(() => {});
    },
    [],
  );

  useEffect(() => {
    let cancelled = false;
    const refresh = async () => {
      const { data, error } = await listThreads();
      if (cancelled || !mountedRef.current) return;
      if (error) setNotice(error);
      if (!data) return;
      for (const thread of data) {
        void listReplies(thread.id)
          .then((result) => {
            if (!cancelled && mountedRef.current && result.error) {
              setNotice(result.error);
            }
          })
          .catch(() => {});
      }
    };
    void refresh().catch(() => {});
    const unsubscribe = subscribeSocial(() => {
      void refresh().catch(() => {});
    });
    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, []);

  return { notice, run };
}

const CATEGORY_STYLES: Record<ForumCategory, string> = {
  "Interview Experiences": "border-info/40 bg-info/5 text-info",
  "ML Questions": "border-accent/40 bg-accent/5 text-accent",
  "Contest Debriefs": "border-warning/40 bg-warning/5 text-warning",
  General: "border-hairline text-body-mid",
};

const REF_PATTERN = /#([a-z0-9][a-z0-9-]*)/gi;

function parseRefs(input: string): string[] {
  const out: string[] = [];
  for (const token of input.split(/[\s,]+/)) {
    const id = token.trim().replace(/^#+/, "").toLowerCase();
    if (!id || !/^[a-z0-9][a-z0-9-]*$/.test(id) || out.includes(id)) continue;
    out.push(id);
  }
  return out;
}

function excerpt(body: string, max = 160): string {
  const text = body
    .split("```")
    .filter((_, i) => i % 2 === 0)
    .join(" ")
    .replace(/`/g, "")
    .replace(/\s+/g, " ")
    .trim();
  if (text.length <= max) return text;
  return `${text.slice(0, max).trimEnd()}…`;
}

const FIELD_CLASSES =
  "w-full rounded-lg border border-hairline bg-canvas-soft px-3 py-2 text-sm text-ink placeholder:text-mute focus:border-accent/50 focus:outline-none focus:ring-1 focus:ring-accent/30";

const PRIMARY_BUTTON_CLASSES =
  "rounded-lg bg-accent px-3.5 py-1.5 text-xs font-medium text-canvas transition-opacity hover:opacity-90 disabled:cursor-default disabled:opacity-40";

const SECONDARY_BUTTON_CLASSES =
  "rounded-lg border border-hairline px-3 py-1.5 text-xs text-body-mid transition-colors hover:bg-canvas-soft hover:text-ink";

function CategoryBadge({ category }: { category: ForumCategory }) {
  return (
    <span
      className={cn(
        "shrink-0 rounded-full border px-1.5 py-0.5 text-[10px] font-medium",
        CATEGORY_STYLES[category],
      )}
    >
      {category}
    </span>
  );
}

function ProblemRefChip({ id }: { id: string }) {
  return (
    <button
      type="button"
      onClick={() =>
        window.dispatchEvent(
          new CustomEvent("deepforge:open-problem", { detail: { id } }),
        )
      }
      aria-label={`Open problem ${id}`}
      className="mx-0.5 inline-flex items-center rounded-full border border-hairline bg-canvas-soft px-1.5 py-0.5 align-baseline font-mono text-[10px] text-accent transition-colors hover:border-accent/40 hover:bg-accent/5"
    >
      #{id}
    </button>
  );
}

function renderInline(text: string, keyPrefix: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  const parts = text.split("`");
  parts.forEach((part, i) => {
    if (i % 2 === 1) {
      nodes.push(
        <code key={`${keyPrefix}-code-${i}`} className="font-mono text-accent">
          {part}
        </code>,
      );
      return;
    }
    let last = 0;
    REF_PATTERN.lastIndex = 0;
    let match: RegExpExecArray | null;
    while ((match = REF_PATTERN.exec(part)) !== null) {
      if (match.index > last) {
        nodes.push(
          <span key={`${keyPrefix}-text-${i}-${last}`}>
            {part.slice(last, match.index)}
          </span>,
        );
      }
      nodes.push(
        <ProblemRefChip
          key={`${keyPrefix}-ref-${i}-${match.index}`}
          id={match[1].toLowerCase()}
        />,
      );
      last = match.index + match[0].length;
    }
    if (last < part.length) {
      nodes.push(
        <span key={`${keyPrefix}-text-${i}-${last}`}>{part.slice(last)}</span>,
      );
    }
  });
  return nodes;
}

function ForumBody({ body }: { body: string }) {
  const segments = body.split("```");
  return (
    <div className="text-sm leading-relaxed text-body">
      {segments.map((segment, i) => {
        if (i % 2 === 1) {
          const code = segment
            .replace(/^[a-zA-Z0-9_+#-]*\n/, "")
            .replace(/\n$/, "");
          return (
            <pre
              key={`code-${i}`}
              className="df-scroll mt-2 overflow-x-auto rounded-lg border border-hairline bg-canvas-soft p-3 font-mono text-xs"
            >
              {code}
            </pre>
          );
        }
        if (!segment) return null;
        return (
          <div key={`text-${i}`} className="whitespace-pre-wrap break-words">
            {renderInline(segment, `t-${i}`)}
          </div>
        );
      })}
    </div>
  );
}

function UpvoteButton({
  count,
  active,
  label,
  onClick,
}: {
  count: number;
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      aria-label={
        active
          ? `Remove upvote from ${label}, ${count} total`
          : `Upvote ${label}, ${count} total`
      }
      className={cn(
        "inline-flex items-center gap-1 rounded-md border px-2 py-0.5 font-mono text-[11px] transition-colors",
        active
          ? "border-accent/40 text-accent"
          : "border-hairline text-body-mid hover:bg-canvas-soft hover:text-ink",
      )}
    >
      <span aria-hidden>▲</span>
      {count}
    </button>
  );
}

function ThreadMeta({ thread }: { thread: ForumThread }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <CategoryBadge category={thread.category} />
      <span className="text-[11px] text-mute">{thread.author}</span>
      <span aria-hidden className="text-[11px] text-mute">
        ·
      </span>
      <time dateTime={thread.createdAt} className="text-[11px] text-mute">
        {formatRelativeTime(thread.createdAt)}
      </time>
    </div>
  );
}

export function Discuss({ problemId }: DiscussProps) {
  const snapshot = useSyncExternalStore(
    subscribeForum,
    getClientForumSnapshot,
    getServerForumSnapshot,
  );
  const { notice, run } = useSocialSync();
  const signedOutHint = useGlobalForumHint();

  const [filter, setFilter] = useState<ForumCategory | "All">("All");
  const [openThreadId, setOpenThreadId] = useState<string | null>(null);
  const [composing, setComposing] = useState(false);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<ForumCategory>("ML Questions");
  const [body, setBody] = useState("");
  const [refs, setRefs] = useState(problemId ? `#${problemId}` : "");
  const [formError, setFormError] = useState<string | null>(null);
  const [replyDraft, setReplyDraft] = useState("");
  const [replyError, setReplyError] = useState<string | null>(null);

  const formTitleRef = useRef<HTMLInputElement | null>(null);
  const detailRef = useRef<HTMLDivElement | null>(null);
  const lastThreadIdRef = useRef<string | null>(null);

  const replyCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const reply of snapshot.replies) {
      counts.set(reply.threadId, (counts.get(reply.threadId) ?? 0) + 1);
    }
    return counts;
  }, [snapshot.replies]);

  const threads = useMemo(
    () =>
      filter === "All"
        ? snapshot.threads
        : snapshot.threads.filter((thread) => thread.category === filter),
    [snapshot.threads, filter],
  );

  const openThread = useMemo(
    () => snapshot.threads.find((thread) => thread.id === openThreadId) ?? null,
    [snapshot.threads, openThreadId],
  );

  const openReplies = useMemo(
    () =>
      openThreadId
        ? snapshot.replies.filter((reply) => reply.threadId === openThreadId)
        : [],
    [snapshot.replies, openThreadId],
  );

  const upvotedThreads = useMemo(
    () => new Set(snapshot.upvotedThreadIds),
    [snapshot.upvotedThreadIds],
  );
  const upvotedReplies = useMemo(
    () => new Set(snapshot.upvotedReplyIds),
    [snapshot.upvotedReplyIds],
  );

  const parsedRefs = useMemo(() => parseRefs(refs), [refs]);

  useEffect(() => {
    if (composing) formTitleRef.current?.focus();
  }, [composing]);

  useEffect(() => {
    if (openThreadId) detailRef.current?.focus();
  }, [openThreadId]);

  useEffect(() => {
    if (openThreadId) run(listReplies(openThreadId));
  }, [openThreadId, run]);

  const openDetail = (id: string) => {
    lastThreadIdRef.current = id;
    setComposing(false);
    setFormError(null);
    setOpenThreadId(id);
  };

  const closeDetail = () => {
    const id = lastThreadIdRef.current;
    setOpenThreadId(null);
    setReplyDraft("");
    setReplyError(null);
    requestAnimationFrame(() => {
      if (id) document.getElementById(`df-thread-${id}`)?.focus();
    });
  };

  const toggleComposer = () => {
    const next = !composing;
    setComposing(next);
    if (next) {
      setOpenThreadId(null);
      setFormError(null);
    }
  };

  const submitThread = () => {
    const cleanTitle = title.trim();
    const cleanBody = body.trim();
    if (cleanTitle.length < 3) {
      setFormError("Give your thread a title of at least 3 characters.");
      return;
    }
    if (!cleanBody) {
      setFormError("Add some detail to the body before posting.");
      return;
    }
    const draft = {
      title: cleanTitle,
      body: cleanBody,
      category,
      problemRefs: parseRefs(refs),
      username: getUserName(),
    };
    setTitle("");
    setBody("");
    setCategory("ML Questions");
    setRefs(problemId ? `#${problemId}` : "");
    setFormError(null);
    setComposing(false);
    setFilter("All");
    run(createThread(draft), (thread) => {
      lastThreadIdRef.current = thread.id;
      setOpenThreadId(thread.id);
    });
  };

  const submitReply = () => {
    const text = replyDraft.trim();
    if (!openThreadId) return;
    if (!text) {
      setReplyError("Write a reply first.");
      return;
    }
    run(
      createReply({
        threadId: openThreadId,
        body: text,
        username: getUserName(),
      }),
    );
    setReplyDraft("");
    setReplyError(null);
  };

  const onComposerKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault();
      submitThread();
    }
  };

  const onReplyKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault();
      submitReply();
    }
  };

  return (
    <section className="mt-8" aria-label="Discuss forum">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <h3 className="text-xs font-medium text-body-mid">Discuss</h3>
          <span
            className="rounded-full border border-hairline px-1.5 py-0.5 font-mono text-[10px] text-body-mid"
            aria-label={`${snapshot.threads.length} threads`}
          >
            {snapshot.threads.length}
          </span>
        </div>
        <button
          type="button"
          onClick={toggleComposer}
          aria-expanded={composing}
          className={cn(
            "rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
            composing
              ? "border border-hairline text-body-mid hover:bg-canvas-soft hover:text-ink"
              : "bg-accent text-canvas transition-opacity hover:opacity-90",
          )}
        >
          {composing ? "Cancel" : "New thread"}
        </button>
      </div>

      {notice && (
        <p role="status" className="mb-3 text-[11px] text-error">
          {notice}
        </p>
      )}

      {composing && (
        <form
          className="df-slide-up mb-4 rounded-lg border border-hairline bg-canvas-card p-4"
          aria-label="New thread"
          onSubmit={(e) => {
            e.preventDefault();
            submitThread();
          }}
        >
          <div className="space-y-3">
            <div>
              <label
                htmlFor="df-thread-title"
                className="mb-1 block text-[11px] font-medium text-body-mid"
              >
                Title
              </label>
              <input
                id="df-thread-title"
                ref={formTitleRef}
                type="text"
                value={title}
                maxLength={140}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="What do you want to discuss?"
                aria-invalid={formError ? true : undefined}
                className={FIELD_CLASSES}
              />
            </div>

            <div>
              <label
                htmlFor="df-thread-category"
                className="mb-1 block text-[11px] font-medium text-body-mid"
              >
                Category
              </label>
              <select
                id="df-thread-category"
                value={category}
                onChange={(e) =>
                  setCategory(e.target.value as ForumCategory)
                }
                className={FIELD_CLASSES}
              >
                {FORUM_CATEGORIES.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="df-thread-body"
                className="mb-1 block text-[11px] font-medium text-body-mid"
              >
                Body
              </label>
              <textarea
                id="df-thread-body"
                value={body}
                rows={4}
                onChange={(e) => setBody(e.target.value)}
                onKeyDown={onComposerKeyDown}
                placeholder="Share context, what you tried, what you expected. Use `code` and #problem refs like #dl-003."
                aria-invalid={formError ? true : undefined}
                className={cn(FIELD_CLASSES, "df-scroll resize-y")}
              />
            </div>

            <div>
              <label
                htmlFor="df-thread-refs"
                className="mb-1 block text-[11px] font-medium text-body-mid"
              >
                Problem refs
              </label>
              <input
                id="df-thread-refs"
                type="text"
                value={refs}
                onChange={(e) => setRefs(e.target.value)}
                placeholder="#dl-003, #ml-009"
                className={FIELD_CLASSES}
              />
              {parsedRefs.length > 0 && (
                <div className="mt-1.5 flex flex-wrap items-center gap-1">
                  <span className="text-[10px] text-mute">References:</span>
                  {parsedRefs.map((id) => (
                    <ProblemRefChip key={id} id={id} />
                  ))}
                </div>
              )}
            </div>
          </div>

          {formError && (
            <p role="alert" className="mt-2 text-[11px] text-error">
              {formError}
            </p>
          )}

          {signedOutHint && (
            <p className="mt-2 text-[11px] text-mute">
              Sign in to post to the global forum.
            </p>
          )}

          <div className="mt-3 flex flex-wrap items-center justify-end gap-2">
            <span className="mr-auto hidden text-[11px] text-mute sm:inline">
              Ctrl/Cmd+Enter to post
            </span>
            <button type="submit" className={PRIMARY_BUTTON_CLASSES}>
              Post thread
            </button>
          </div>
        </form>
      )}

      {openThread ? (
        <div
          ref={detailRef}
          tabIndex={-1}
          role="region"
          aria-label={`Thread: ${openThread.title}`}
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              e.stopPropagation();
              closeDetail();
            }
          }}
          className="df-slide-up rounded-lg border border-hairline bg-canvas-card p-4 outline-none"
        >
          <div className="flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={closeDetail}
              className="inline-flex items-center gap-1 text-xs text-body-mid transition-colors hover:text-ink"
            >
              <span aria-hidden>←</span>
              All threads
            </button>
            <button
              type="button"
              onClick={() => {
                if (window.confirm("Delete this thread and its replies?")) {
                  run(deleteThread(openThread.id), () => setOpenThreadId(null));
                }
              }}
              className="rounded-md border border-hairline px-2 py-0.5 text-[11px] text-body-mid transition-colors hover:bg-canvas-soft hover:text-error"
            >
              Delete
            </button>
          </div>

          <div className="mt-3">
            <ThreadMeta thread={openThread} />
          </div>

          <h4 className="mt-2 text-base font-semibold text-ink">
            {openThread.title}
          </h4>

          <div className="mt-3">
            <ForumBody body={openThread.body} />
          </div>

          <div className="mt-3 flex items-center gap-2">
            <UpvoteButton
              count={openThread.upvotes}
              active={upvotedThreads.has(openThread.id)}
              label="thread"
              onClick={() => run(toggleThreadUpvote(openThread.id))}
            />
            <span className="text-[11px] text-mute">
              {openReplies.length}{" "}
              {openReplies.length === 1 ? "reply" : "replies"}
            </span>
          </div>

          <div className="mt-4 border-t border-hairline pt-3">
            <h5 className="mb-2 text-[11px] font-medium text-body-mid">
              Replies
            </h5>

            {openReplies.length === 0 ? (
              <p className="text-xs text-mute">No replies yet. Be the first.</p>
            ) : (
              <ul className="space-y-2.5">
                {openReplies.map((reply) => (
                  <li
                    key={reply.id}
                    className="rounded-lg border border-hairline bg-canvas p-3"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-medium text-ink">
                        {reply.author}
                      </span>
                      <time
                        dateTime={reply.createdAt}
                        className="text-[11px] text-mute"
                      >
                        {formatRelativeTime(reply.createdAt)}
                      </time>
                    </div>
                    <div className="mt-2">
                      <ForumBody body={reply.body} />
                    </div>
                    <div className="mt-2.5">
                      <UpvoteButton
                        count={reply.upvotes}
                        active={upvotedReplies.has(reply.id)}
                        label="reply"
                        onClick={() => run(toggleReplyUpvote(reply.id))}
                      />
                    </div>
                  </li>
                ))}
              </ul>
            )}

            <div className="mt-3">
              <textarea
                value={replyDraft}
                rows={3}
                onChange={(e) => setReplyDraft(e.target.value)}
                onKeyDown={onReplyKeyDown}
                placeholder="Write a reply…"
                aria-label="Write a reply"
                className={cn(FIELD_CLASSES, "df-scroll resize-y")}
              />
              {replyError && (
                <p role="alert" className="mt-1 text-[11px] text-error">
                  {replyError}
                </p>
              )}
              <div className="mt-2 flex flex-wrap items-center justify-end gap-2">
                <span className="mr-auto hidden text-[11px] text-mute sm:inline">
                  Ctrl/Cmd+Enter to post
                </span>
                <button
                  type="button"
                  onClick={submitReply}
                  disabled={!replyDraft.trim()}
                  className={PRIMARY_BUTTON_CLASSES}
                >
                  Reply
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <>
          <div
            className="mb-3 flex flex-wrap items-center gap-1.5"
            role="group"
            aria-label="Filter threads by category"
          >
            {(["All", ...FORUM_CATEGORIES] as const).map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setFilter(option)}
                aria-pressed={filter === option}
                className={cn(
                  "rounded-full border px-2.5 py-1 text-[11px] transition-colors",
                  filter === option
                    ? "border-accent/40 bg-accent/5 text-accent"
                    : "border-hairline text-body-mid hover:bg-canvas-soft hover:text-ink",
                )}
              >
                {option}
              </button>
            ))}
          </div>

          {threads.length === 0 ? (
            <p className="mt-4 text-sm text-body-mid">
              {snapshot.threads.length === 0
                ? "No threads yet. Start the first one."
                : "No threads in this category yet."}
            </p>
          ) : (
            <ul className="space-y-3">
              {threads.map((thread) => (
                <li key={thread.id}>
                  <article className="rounded-lg border border-hairline bg-canvas-card p-3 transition-colors hover:border-accent/30">
                    <ThreadMeta thread={thread} />
                    <button
                      type="button"
                      id={`df-thread-${thread.id}`}
                      onClick={() => openDetail(thread.id)}
                      className="mt-2 block w-full text-left text-sm font-semibold text-ink transition-colors hover:text-accent focus-visible:outline-none focus-visible:underline"
                    >
                      {thread.title}
                    </button>
                    <p className="mt-1 text-xs leading-relaxed text-body-mid">
                      {excerpt(thread.body)}
                    </p>
                    {thread.problemRefs.length > 0 && (
                      <div className="mt-2 flex flex-wrap items-center gap-1">
                        {thread.problemRefs.map((id) => (
                          <ProblemRefChip key={id} id={id} />
                        ))}
                      </div>
                    )}
                    <div className="mt-2.5 flex items-center gap-2">
                      <UpvoteButton
                        count={thread.upvotes}
                        active={upvotedThreads.has(thread.id)}
                        label="thread"
                        onClick={() => run(toggleThreadUpvote(thread.id))}
                      />
                      <button
                        type="button"
                        onClick={() => openDetail(thread.id)}
                        className="rounded-md border border-hairline px-2 py-0.5 text-[11px] text-body-mid transition-colors hover:bg-canvas-soft hover:text-ink"
                      >
                        {replyCounts.get(thread.id) ?? 0}{" "}
                        {replyCounts.get(thread.id) === 1 ? "reply" : "replies"}
                      </button>
                    </div>
                  </article>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </section>
  );
}
