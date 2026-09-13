"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import {
  COMMENTS_CHANGE_EVENT,
  formatRelativeTime,
  getComments,
  type Comment,
} from "@/lib/comments";
import { getAuthEmail, isSupabaseConfigured, onAuthChange } from "@/lib/auth";
import { getUserName } from "@/lib/leaderboard";
import {
  createComment,
  listComments,
  MAX_COMMENT_LENGTH,
  subscribe as subscribeSocial,
  toggleCommentUpvote,
  type SocialResult,
} from "@/lib/sync/social";
import { cn } from "@/lib/utils";

interface ProblemCommentsProps {
  problemId: string;
}

export function voteAccessFrom(
  email: string | null,
  configured: boolean,
): { canVote: boolean; signedOutHint: boolean } {
  const signedOutHint = configured && email === null;
  return { canVote: !signedOutHint, signedOutHint };
}

export function validateCommentBody(body: string): string | null {
  const text = body.trim();
  if (!text) return "Write a comment first.";
  if (text.length > MAX_COMMENT_LENGTH) {
    return `Comments are limited to ${MAX_COMMENT_LENGTH} characters.`;
  }
  return null;
}

const FIELD_CLASSES =
  "w-full rounded-lg border border-hairline bg-canvas-soft px-3 py-2 text-sm text-ink placeholder:text-mute focus:border-accent/50 focus:outline-none focus:ring-1 focus:ring-accent/30";

const PRIMARY_BUTTON_CLASSES =
  "inline-flex min-h-11 items-center justify-center rounded-lg bg-accent px-3.5 py-1.5 text-xs font-medium text-canvas transition-opacity hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 disabled:cursor-default disabled:opacity-40 sm:min-h-0";

const SECONDARY_BUTTON_CLASSES =
  "inline-flex min-h-11 items-center justify-center rounded-lg border border-hairline px-3 py-1.5 text-xs text-body-mid transition-colors hover:bg-canvas-soft hover:text-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 sm:min-h-0";

const EMPTY_COMMENTS: Comment[] = [];

let commentsCache: { problemId: string; comments: Comment[] } | null = null;

function readComments(problemId: string): Comment[] {
  if (!commentsCache || commentsCache.problemId !== problemId) {
    commentsCache = { problemId, comments: getComments(problemId) };
  }
  return commentsCache.comments;
}

function subscribeComments(onStoreChange: () => void): () => void {
  const onChange = () => {
    commentsCache = null;
    onStoreChange();
  };
  window.addEventListener(COMMENTS_CHANGE_EVENT, onChange);
  return () => window.removeEventListener(COMMENTS_CHANGE_EVENT, onChange);
}

function serverComments(): Comment[] {
  return EMPTY_COMMENTS;
}

function UpvoteButton({
  count,
  active,
  disabled,
  onClick,
}: {
  count: number;
  active: boolean;
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={active}
      aria-label={
        disabled
          ? "Sign in to vote"
          : active
            ? `Remove upvote, ${count} total`
            : `Upvote comment, ${count} total`
      }
      title={disabled ? "Sign in to vote" : undefined}
      className={cn(
        "inline-flex min-h-11 items-center justify-center gap-1 rounded-md border px-3 py-0.5 font-mono text-[11px] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 disabled:cursor-default disabled:opacity-40 sm:min-h-0 sm:px-2",
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

export function ProblemComments({ problemId }: ProblemCommentsProps) {
  const comments = useSyncExternalStore(
    subscribeComments,
    () => readComments(problemId),
    serverComments,
  );

  const [notice, setNotice] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [posting, setPosting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [signedOutHint, setSignedOutHint] = useState(false);

  const mountedRef = useRef(true);
  const composerRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (!isSupabaseConfigured()) return;
    const update = (email: string | null) =>
      setSignedOutHint(voteAccessFrom(email, true).signedOutHint);
    update(getAuthEmail());
    return onAuthChange(update);
  }, []);

  useEffect(() => {
    let cancelled = false;
    const refresh = async () => {
      const { error } = await listComments(problemId);
      if (cancelled || !mountedRef.current) return;
      setLoading(false);
      if (error) setNotice(error);
    };
    void refresh().catch(() => {});
    const unsubscribe = subscribeSocial(() => {
      void refresh().catch(() => {});
    });
    const onStorage = (event: StorageEvent) => {
      if (event.key === null || event.key.startsWith("deepforge:")) {
        void refresh().catch(() => {});
      }
    };
    window.addEventListener("storage", onStorage);
    return () => {
      cancelled = true;
      unsubscribe();
      window.removeEventListener("storage", onStorage);
    };
  }, [problemId]);

  const run = useCallback((task: Promise<SocialResult<unknown>>) => {
    void task
      .then((result) => {
        if (!mountedRef.current) return;
        setNotice(result.error);
      })
      .catch(() => {});
  }, []);

  const submit = () => {
    const error = validateCommentBody(draft);
    if (error) {
      setFormError(error);
      return;
    }
    if (posting) return;
    const body = draft.trim();
    setDraft("");
    setFormError(null);
    setPosting(true);
    void createComment({ problemId, body, username: getUserName() })
      .then((result) => {
        if (!mountedRef.current) return;
        setNotice(result.error);
      })
      .catch(() => {})
      .finally(() => {
        if (mountedRef.current) setPosting(false);
      });
  };

  const onComposerKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault();
      submit();
    }
  };

  const canVote = !signedOutHint;

  return (
    <section aria-label={`Discussion about ${problemId}`} className="space-y-4">
      <form
        className="rounded-lg border border-hairline bg-canvas-card p-4 sm:p-5"
        aria-label="Add a comment"
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
      >
        <label
          htmlFor={`df-comment-body-${problemId}`}
          className="mb-1 block text-[11px] font-medium text-body-mid"
        >
          Add a comment
        </label>
        <textarea
          id={`df-comment-body-${problemId}`}
          ref={composerRef}
          value={draft}
          rows={3}
          maxLength={MAX_COMMENT_LENGTH}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={onComposerKeyDown}
          placeholder="Ask a question, share an approach, or flag an edge case…"
          aria-invalid={formError ? true : undefined}
          className={cn(FIELD_CLASSES, "df-scroll resize-y")}
        />
        {formError && (
          <p role="alert" className="mt-1 text-[11px] text-error">
            {formError}
          </p>
        )}
        {notice && (
          <p role="status" className="mt-1 text-[11px] text-error">
            {notice}
          </p>
        )}
        {signedOutHint && (
          <p className="mt-1 text-[11px] text-mute">
            Sign in to post to the global discussion.
          </p>
        )}
        <div className="mt-3 flex flex-wrap items-center justify-end gap-2">
          <span className="mr-auto hidden text-[11px] text-mute sm:inline">
            Ctrl/Cmd+Enter to post
          </span>
          <button
            type="submit"
            disabled={posting || !draft.trim()}
            aria-busy={posting}
            className={PRIMARY_BUTTON_CLASSES}
          >
            {posting ? "Posting…" : "Post comment"}
          </button>
        </div>
      </form>

      {signedOutHint && comments.length > 0 && (
        <p className="text-[11px] text-mute">Sign in to vote on comments.</p>
      )}

      {loading && comments.length === 0 ? (
        <p role="status" className="text-xs text-mute">
          Loading discussion…
        </p>
      ) : comments.length === 0 ? (
        <div className="rounded-lg border border-dashed border-hairline bg-canvas-card px-4 py-10 text-center sm:py-12">
          <p className="text-sm font-medium text-ink">No discussion yet</p>
          <p className="mx-auto mt-1 max-w-sm text-xs leading-relaxed text-body-mid">
            Ask the first question about{" "}
            <span className="font-mono text-mute">{problemId}</span>.
          </p>
          <button
            type="button"
            onClick={() => composerRef.current?.focus()}
            className={cn(PRIMARY_BUTTON_CLASSES, "mt-4")}
          >
            Ask the first question
          </button>
        </div>
      ) : (
        <ul className="space-y-3">
          {comments.map((comment) => (
            <li
              key={comment.id}
              className="rounded-lg border border-hairline bg-canvas-card p-4 sm:p-5"
            >
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-medium text-ink">
                  {comment.author}
                </span>
                <time
                  dateTime={comment.createdAt}
                  className="text-[11px] text-mute"
                >
                  {formatRelativeTime(comment.createdAt)}
                </time>
              </div>
              <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-relaxed text-body">
                {comment.body}
              </p>
              <div className="mt-3">
                <UpvoteButton
                  count={comment.upvotes}
                  active={comment.upvotedByMe}
                  disabled={!canVote}
                  onClick={() => run(toggleCommentUpvote(comment.id))}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
