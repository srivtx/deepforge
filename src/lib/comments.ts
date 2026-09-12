import { getUserName } from "@/lib/leaderboard";

export interface Comment {
  id: string;
  problemId: string;
  author: string;
  body: string;
  createdAt: string;
  upvotes: number;
  upvotedByMe: boolean;
}

const STORAGE_KEY = "deepforge:comments:v1";

export const COMMENTS_CHANGE_EVENT = "deepforge:comments-change";

type CommentStore = Record<string, Comment[]>;

function isComment(value: unknown): value is Comment {
  if (typeof value !== "object" || value === null) return false;
  const c = value as Record<string, unknown>;
  return (
    typeof c.id === "string" &&
    typeof c.problemId === "string" &&
    typeof c.author === "string" &&
    typeof c.body === "string" &&
    typeof c.createdAt === "string" &&
    typeof c.upvotes === "number" &&
    typeof c.upvotedByMe === "boolean"
  );
}

function read(): CommentStore {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
      return {};
    }
    const store: CommentStore = {};
    for (const [problemId, list] of Object.entries(
      parsed as Record<string, unknown>,
    )) {
      if (Array.isArray(list)) store[problemId] = list.filter(isComment);
    }
    return store;
  } catch {
    return {};
  }
}

function write(store: CommentStore): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
    window.dispatchEvent(new CustomEvent(COMMENTS_CHANGE_EVENT));
  } catch {
    /* storage unavailable — silently ignore */
  }
}

function makeId(): string {
  return `c-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export function getComments(problemId: string): Comment[] {
  const list = read()[problemId];
  if (!list) return [];
  return [...list].reverse().sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function addComment(problemId: string, body: string): void {
  const text = body.trim();
  if (!text) return;
  const store = read();
  const comment: Comment = {
    id: makeId(),
    problemId,
    author: getUserName(),
    body: text,
    createdAt: new Date().toISOString(),
    upvotes: 0,
    upvotedByMe: false,
  };
  store[problemId] = [...(store[problemId] ?? []), comment];
  write(store);
}

export function toggleUpvote(problemId: string, commentId: string): void {
  const store = read();
  const list = store[problemId];
  if (!list) return;
  let changed = false;
  store[problemId] = list.map((comment) => {
    if (comment.id !== commentId) return comment;
    changed = true;
    const upvotedByMe = !comment.upvotedByMe;
    return {
      ...comment,
      upvotedByMe,
      upvotes: Math.max(0, comment.upvotes + (upvotedByMe ? 1 : -1)),
    };
  });
  if (changed) write(store);
}

export function deleteComment(problemId: string, commentId: string): void {
  const store = read();
  const list = store[problemId];
  if (!list) return;
  const target = list.find((comment) => comment.id === commentId);
  if (!target || target.author !== getUserName()) return;
  const next = list.filter((comment) => comment.id !== commentId);
  if (next.length === list.length) return;
  if (next.length === 0) {
    delete store[problemId];
  } else {
    store[problemId] = next;
  }
  write(store);
}
