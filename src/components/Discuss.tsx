"use client";

import { useSyncExternalStore, useState, type ReactNode } from "react";
import {
  addComment,
  deleteComment,
  getComments,
  toggleUpvote,
  COMMENTS_CHANGE_EVENT,
  type Comment,
} from "@/lib/comments";
import { getUserName } from "@/lib/leaderboard";
import { cn } from "@/lib/utils";

interface DiscussProps {
  problemId: string;
}

const EMPTY_COMMENTS: Comment[] = [];

const cache = new Map<string, Comment[]>();

function getSnapshotFor(problemId: string): Comment[] {
  const cached = cache.get(problemId);
  if (cached) return cached;
  const fresh = getComments(problemId);
  cache.set(problemId, fresh);
  return fresh;
}

function getServerSnapshot(): Comment[] {
  return EMPTY_COMMENTS;
}

function subscribe(onStoreChange: () => void): () => void {
  const onChange = () => {
    cache.clear();
    onStoreChange();
  };
  window.addEventListener(COMMENTS_CHANGE_EVENT, onChange);
  return () => window.removeEventListener(COMMENTS_CHANGE_EVENT, onChange);
}

function relativeTime(iso: string): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "";
  const minutes = Math.floor((Date.now() - then) / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function renderInline(text: string, keyPrefix: string): ReactNode[] {
  return text.split("`").map((part, i) =>
    i % 2 === 1 ? (
      <code key={`${keyPrefix}-${i}`} className="font-mono text-accent">
        {part}
      </code>
    ) : (
      <span key={`${keyPrefix}-${i}`}>{part}</span>
    ),
  );
}

function CommentBody({ body }: { body: string }) {
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

export function Discuss({ problemId }: DiscussProps) {
  const comments = useSyncExternalStore(
    subscribe,
    () => getSnapshotFor(problemId),
    getServerSnapshot,
  );
  const [draft, setDraft] = useState("");
  const canPost = draft.trim().length > 0;
  const me = getUserName();

  const post = () => {
    if (!canPost) return;
    addComment(problemId, draft);
    setDraft("");
  };

  const onComposerKeyDown = (
    e: React.KeyboardEvent<HTMLTextAreaElement>,
  ) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault();
      post();
    }
  };

  return (
    <section className="mt-8" aria-label="Discuss">
      <div className="mb-3 flex items-center gap-2">
        <h3 className="text-xs font-medium text-body-mid">Discuss</h3>
        <span className="rounded-full border border-hairline px-1.5 py-0.5 font-mono text-[10px] text-body-mid">
          {comments.length}
        </span>
      </div>

      <textarea
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={onComposerKeyDown}
        rows={3}
        placeholder="Ask a question or share an approach…"
        aria-label="Write a comment"
        className="df-scroll w-full resize-y rounded-lg border border-hairline bg-canvas-soft px-3 py-2 text-sm text-ink placeholder:text-mute focus:border-accent/50 focus:outline-none focus:ring-1 focus:ring-accent/30"
      />
      <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
        <span className="hidden text-[11px] text-mute sm:inline">
          Ctrl/Cmd+Enter to post
        </span>
        <button
          type="button"
          onClick={post}
          disabled={!canPost}
          className="rounded-lg bg-accent px-3.5 py-1.5 text-xs font-medium text-canvas transition-opacity hover:opacity-90 disabled:cursor-default disabled:opacity-40"
        >
          Post
        </button>
      </div>

      {comments.length === 0 ? (
        <p className="mt-4 text-sm text-body-mid">
          No comments yet. Be the first.
        </p>
      ) : (
        <ul className="mt-4 space-y-3">
          {comments.map((comment) => (
            <li
              key={comment.id}
              className="rounded-lg border border-hairline bg-canvas-card p-3"
            >
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                <span className="text-xs font-medium text-ink">
                  {comment.author}
                </span>
                <span className="text-[11px] text-mute">
                  {relativeTime(comment.createdAt)}
                </span>
              </div>

              <div className="mt-2">
                <CommentBody body={comment.body} />
              </div>

              <div className="mt-2.5 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => toggleUpvote(problemId, comment.id)}
                  aria-pressed={comment.upvotedByMe}
                  aria-label={
                    comment.upvotedByMe
                      ? `Remove upvote, ${comment.upvotes} total`
                      : `Upvote, ${comment.upvotes} total`
                  }
                  className={cn(
                    "inline-flex items-center gap-1 rounded-md border px-2 py-0.5 font-mono text-[11px] transition-colors",
                    comment.upvotedByMe
                      ? "border-accent/40 text-accent"
                      : "border-hairline text-body-mid hover:bg-canvas-soft hover:text-ink",
                  )}
                >
                  <span aria-hidden>▲</span>
                  {comment.upvotes}
                </button>
                {comment.author === me && (
                  <button
                    type="button"
                    onClick={() => deleteComment(problemId, comment.id)}
                    aria-label={`Delete comment by ${comment.author}`}
                    className="rounded-md border border-hairline px-2 py-0.5 text-[11px] text-body-mid transition-colors hover:bg-canvas-soft hover:text-error"
                  >
                    Delete
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
