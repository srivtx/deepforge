import {
  FORUM_CATEGORIES,
  addComment,
  addReply,
  createThread as createLocalThread,
  deleteThread as deleteLocalThread,
  getComments,
  getForumSnapshot,
  getReplies,
  isForumCategory,
  mergeRemoteComments,
  mergeRemoteReplies,
  mergeRemoteThreads,
  mergeRemoteUpvoteIds,
  setReplyUpvoteCount,
  setThreadUpvoteCount,
  toggleUpvote as toggleLocalCommentVote,
  upvoteReply as upvoteLocalReply,
  upvoteThread as upvoteLocalThread,
  type Comment,
  type ForumCategory,
  type ForumReply,
  type ForumThread,
} from "@/lib/comments";
import { getDailyDateKey, getDailyState } from "@/lib/daily";
import { getUserName } from "@/lib/leaderboard";
import { getProgress, type ProgressMap } from "@/lib/progress";
import { getCachedSession, onSessionChange } from "@/lib/sync/backend";
import { readRaw, writeRaw } from "@/lib/sync/localAdapter";
import {
  getRemoteClient,
  isRemoteActive,
  type RemoteClient,
  type RemoteResult,
} from "@/lib/sync/remote";

export interface SocialResult<T> {
  data: T | null;
  error: string | null;
}

export interface SocialUpvoteState {
  upvoted: boolean;
  upvotes: number;
}

export interface SocialThreadInput {
  title: string;
  body: string;
  username: string;
  problemId?: string;
  category?: ForumCategory;
  problemRefs?: string[];
}

export interface SocialReplyInput {
  threadId: string;
  body: string;
  username: string;
}

export interface SocialCommentInput {
  problemId: string;
  body: string;
  username: string;
}

/** Page size used by the paged list helpers (threads, replies, comments). */
export const SOCIAL_PAGE_SIZE = 20;

const MAX_SOCIAL_PAGE_SIZE = 50;

export interface SocialPageOptions {
  offset?: number;
  limit?: number;
}

/**
 * A paged list result. `data` stays the full merged local snapshot so the
 * local-first rendering path is byte-for-byte identical to before; `remote`
 * carries just this page of rows and `nextOffset` the cursor for the next one.
 */
export interface SocialPageResult<T> extends SocialResult<T[]> {
  remote: T[];
  hasMore: boolean;
  nextOffset: number | null;
}

type Row = Record<string, unknown>;

type RemoteContext = { client: RemoteClient; userId: string } | { error: string };

interface RemoteDeleteQuery {
  delete(): {
    eq(column: string, value: unknown): PromiseLike<RemoteResult<unknown>>;
  };
}

type RpcCall = (
  fn: string,
  args?: Record<string, unknown>,
) => PromiseLike<RemoteResult<unknown>>;

const listeners = new Set<() => void>();
const pushingThreads = new Set<string>();
const pushingReplies = new Set<string>();
const pushingComments = new Set<string>();
const pendingUpvotes = new Set<string>();

/**
 * Ids already confirmed remote this session (fetched in a page or inserted
 * successfully). Pending-push scans skip them so paging never re-inserts rows
 * that simply fell outside the current window.
 */
const attemptedThreadPushes = new Set<string>();
const attemptedReplyPushes = new Set<string>();
const attemptedCommentPushes = new Set<string>();

/**
 * Session generation. It advances only when the cached session changes, so
 * concurrent list calls (e.g. one `listReplies` per thread) never invalidate
 * each other's merges. Each list call snapshots it and discards its response
 * only when the session changed while the request was in flight.
 */
let sessionGeneration = 0;
let sessionWatchInstalled = false;

function notify(): void {
  for (const listener of [...listeners]) {
    try {
      listener();
    } catch {}
  }
}

function currentGeneration(): number {
  return sessionGeneration;
}

function ensureSessionWatch(): void {
  if (sessionWatchInstalled) return;
  sessionWatchInstalled = true;
  onSessionChange(() => {
    sessionGeneration += 1;
    attemptedThreadPushes.clear();
    attemptedReplyPushes.clear();
    attemptedCommentPushes.clear();
    notify();
  });
}

export function subscribe(callback: () => void): () => void {
  listeners.add(callback);
  ensureSessionWatch();
  return () => {
    listeners.delete(callback);
  };
}

function errorMessage(error: unknown): string {
  if (!error) return "Something went wrong.";
  if (typeof error === "string") return error;
  if (typeof error === "object") {
    const message = (error as { message?: unknown }).message;
    if (typeof message === "string" && message) return message;
  }
  return String(error);
}

function makeId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function cleanUsername(username: string): string {
  const name = typeof username === "string" ? username.trim() : "";
  return name || "Anonymous";
}

function normalizePage(options: SocialPageOptions | undefined): {
  offset: number;
  limit: number;
} {
  const rawLimit = options?.limit ?? SOCIAL_PAGE_SIZE;
  const rawOffset = options?.offset ?? 0;
  const limit = Number.isFinite(rawLimit) ? Math.floor(rawLimit) : SOCIAL_PAGE_SIZE;
  const offset = Number.isFinite(rawOffset) ? Math.floor(rawOffset) : 0;
  return {
    limit: Math.min(Math.max(limit, 1), MAX_SOCIAL_PAGE_SIZE),
    offset: Math.max(offset, 0),
  };
}

/**
 * Local structural view of a PostgREST builder. The shared `RemoteQuery`
 * interface intentionally stays narrow, so paging is expressed through this
 * cast — mocks in tests implement the same shape.
 */
interface RemotePageQuery extends PromiseLike<RemoteResult<unknown>> {
  select(columns?: string): RemotePageQuery;
  eq(column: string, value: unknown): RemotePageQuery;
  order(column: string, options?: { ascending?: boolean }): RemotePageQuery;
  range(from: number, to: number): RemotePageQuery;
}

function pageQuery(source: unknown): RemotePageQuery {
  return source as RemotePageQuery;
}

const THREAD_COLUMNS =
  "id, author_name, title, body, category, problem_refs, upvote_count, created_at";
const REPLY_COLUMNS =
  "id, thread_id, author_name, body, upvote_count, created_at";
const COMMENT_COLUMNS =
  "id, problem_id, author_name, body, upvote_count, created_at";

function normalizeRefs(
  refs: string[] | undefined,
  problemId?: string,
): string[] {
  const out: string[] = [];
  const add = (raw: unknown) => {
    if (typeof raw !== "string") return;
    const id = raw.trim().replace(/^#+/, "").toLowerCase();
    if (!id || out.includes(id)) return;
    out.push(id);
  };
  if (refs) for (const ref of refs) add(ref);
  add(problemId);
  return out;
}

function stringValue(value: unknown): string | null {
  return typeof value === "string" ? value : null;
}

function mapThreadRow(row: unknown): ForumThread | null {
  if (!row || typeof row !== "object") return null;
  const value = row as Row;
  const id = stringValue(value.id);
  const title = stringValue(value.title);
  if (!id || !title) return null;
  return {
    id,
    title,
    body: stringValue(value.body) ?? "",
    category: isForumCategory(value.category) ? value.category : "General",
    author: stringValue(value.author_name) ?? "Anonymous",
    createdAt: stringValue(value.created_at) ?? "",
    upvotes: typeof value.upvote_count === "number" ? value.upvote_count : 0,
    problemRefs: Array.isArray(value.problem_refs)
      ? value.problem_refs.filter((ref): ref is string => typeof ref === "string")
      : [],
  };
}

function mapReplyRow(row: unknown): ForumReply | null {
  if (!row || typeof row !== "object") return null;
  const value = row as Row;
  const id = stringValue(value.id);
  const threadId = stringValue(value.thread_id);
  if (!id || !threadId) return null;
  return {
    id,
    threadId,
    author: stringValue(value.author_name) ?? "Anonymous",
    body: stringValue(value.body) ?? "",
    createdAt: stringValue(value.created_at) ?? "",
    upvotes: typeof value.upvote_count === "number" ? value.upvote_count : 0,
  };
}

function mapCommentRow(row: unknown, upvotedByMe: boolean): Comment | null {
  if (!row || typeof row !== "object") return null;
  const value = row as Row;
  const id = stringValue(value.id);
  const problemId = stringValue(value.problem_id);
  if (!id || !problemId) return null;
  return {
    id,
    problemId,
    author: stringValue(value.author_name) ?? "Anonymous",
    body: stringValue(value.body) ?? "",
    createdAt: stringValue(value.created_at) ?? "",
    upvotes: typeof value.upvote_count === "number" ? value.upvote_count : 0,
    upvotedByMe,
  };
}

function idsFromRows(data: unknown, column: string): string[] {
  if (!Array.isArray(data)) return [];
  const out: string[] = [];
  for (const row of data) {
    if (!row || typeof row !== "object") continue;
    const value = (row as Row)[column];
    if (typeof value === "string") out.push(value);
  }
  return out;
}

function threadIdentity(thread: ForumThread): string {
  return `${thread.title}\u0000${thread.createdAt}`;
}

function replyIdentity(reply: ForumReply): string {
  return `${reply.threadId}\u0000${reply.body}\u0000${reply.createdAt}`;
}

function commentIdentity(comment: Comment): string {
  return `${comment.author}\u0000${comment.body}\u0000${comment.createdAt}`;
}

function rpcCall(client: RemoteClient): RpcCall | null {
  const candidate = (client as unknown as { rpc?: unknown }).rpc;
  if (typeof candidate !== "function") return null;
  return (candidate as RpcCall).bind(client);
}

function threadRow(thread: ForumThread, userId: string): Row {
  return {
    id: thread.id,
    author_id: userId,
    author_name: thread.author,
    title: thread.title,
    body: thread.body,
    category: thread.category,
    problem_refs: thread.problemRefs,
    upvote_count: thread.upvotes,
    created_at: thread.createdAt,
  };
}

function replyRow(reply: ForumReply, userId: string): Row {
  return {
    id: reply.id,
    thread_id: reply.threadId,
    author_id: userId,
    author_name: reply.author,
    body: reply.body,
    upvote_count: reply.upvotes,
    created_at: reply.createdAt,
  };
}

function commentRow(comment: Comment, userId: string): Row {
  return {
    id: comment.id,
    problem_id: comment.problemId,
    author_id: userId,
    author_name: comment.author,
    body: comment.body,
    upvote_count: comment.upvotes,
    created_at: comment.createdAt,
  };
}

async function acquireRemote(): Promise<RemoteContext | null> {
  if (!isRemoteActive()) return null;
  let client: RemoteClient | null = null;
  try {
    client = await getRemoteClient();
  } catch {
    client = null;
  }
  if (!client) return { error: "Remote sync is unavailable." };
  const session = getCachedSession();
  if (!session) return null;
  return { client, userId: session.userId };
}

async function pushLocalThread(
  client: RemoteClient,
  userId: string,
  thread: ForumThread,
): Promise<string | null> {
  if (pushingThreads.has(thread.id)) return null;
  pushingThreads.add(thread.id);
  try {
    const { error } = await client
      .from("forum_threads")
      .insert(threadRow(thread, userId));
    if (error) {
      if (error.code === "23505") return null;
      return errorMessage(error);
    }
    return null;
  } catch (error) {
    return errorMessage(error);
  } finally {
    pushingThreads.delete(thread.id);
  }
}

async function pushLocalReply(
  client: RemoteClient,
  userId: string,
  reply: ForumReply,
): Promise<string | null> {
  if (pushingReplies.has(reply.id)) return null;
  pushingReplies.add(reply.id);
  try {
    const { error } = await client
      .from("forum_replies")
      .insert(replyRow(reply, userId));
    if (error) {
      if (error.code === "23505" || error.code === "23503") return null;
      return errorMessage(error);
    }
    return null;
  } catch (error) {
    return errorMessage(error);
  } finally {
    pushingReplies.delete(reply.id);
  }
}

async function pushLocalComment(
  client: RemoteClient,
  userId: string,
  comment: Comment,
): Promise<string | null> {
  if (pushingComments.has(comment.id)) return null;
  pushingComments.add(comment.id);
  try {
    const { error } = await client
      .from("comments")
      .insert(commentRow(comment, userId));
    if (error) {
      if (error.code === "23505") return null;
      return errorMessage(error);
    }
    return null;
  } catch (error) {
    return errorMessage(error);
  } finally {
    pushingComments.delete(comment.id);
  }
}

async function fetchOwnUpvoteIds(
  client: RemoteClient,
  userId: string,
): Promise<{ threadIds: string[]; replyIds: string[] }> {
  const [threads, replies] = await Promise.all([
    client.from("forum_thread_upvotes").select("thread_id").eq("user_id", userId),
    client.from("forum_reply_upvotes").select("reply_id").eq("user_id", userId),
  ]);
  if (threads.error) throw threads.error;
  if (replies.error) throw replies.error;
  return {
    threadIds: idsFromRows(threads.data, "thread_id"),
    replyIds: idsFromRows(replies.data, "reply_id"),
  };
}

async function fetchThreadPage(
  client: RemoteClient,
  offset: number,
  limit: number,
): Promise<ForumThread[]> {
  const { data, error } = await pageQuery(client.from("forum_threads"))
    .select(THREAD_COLUMNS)
    .order("created_at", { ascending: false })
    .order("id", { ascending: false })
    .range(offset, offset + limit - 1);
  if (error) throw error;
  return (Array.isArray(data) ? data : [])
    .map(mapThreadRow)
    .filter((thread): thread is ForumThread => thread !== null);
}

async function fetchReplyPage(
  client: RemoteClient,
  threadId: string,
  offset: number,
  limit: number,
): Promise<ForumReply[]> {
  const { data, error } = await pageQuery(client.from("forum_replies"))
    .select(REPLY_COLUMNS)
    .eq("thread_id", threadId)
    .order("created_at", { ascending: false })
    .order("id", { ascending: false })
    .range(offset, offset + limit - 1);
  if (error) throw error;
  return (Array.isArray(data) ? data : [])
    .map(mapReplyRow)
    .filter((reply): reply is ForumReply => reply !== null);
}

async function fetchCommentPage(
  client: RemoteClient,
  problemId: string,
  offset: number,
  limit: number,
): Promise<Comment[]> {
  const { data, error } = await pageQuery(client.from("comments"))
    .select(COMMENT_COLUMNS)
    .eq("problem_id", problemId)
    .order("created_at", { ascending: false })
    .order("id", { ascending: false })
    .range(offset, offset + limit - 1);
  if (error) throw error;
  return (Array.isArray(data) ? data : [])
    .map((row) => mapCommentRow(row, false))
    .filter((comment): comment is Comment => comment !== null);
}

async function pushPendingThreads(
  client: RemoteClient,
  userId: string,
  page: ForumThread[],
): Promise<string | null> {
  for (const thread of page) attemptedThreadPushes.add(thread.id);
  const remoteIds = new Set(page.map((thread) => thread.id));
  const remoteKeys = new Set(page.map(threadIdentity));
  const pending = getForumSnapshot().threads.filter(
    (thread) =>
      !remoteIds.has(thread.id) &&
      !remoteKeys.has(threadIdentity(thread)) &&
      !attemptedThreadPushes.has(thread.id),
  );
  let pushError: string | null = null;
  for (const thread of pending) {
    if (pushingThreads.has(thread.id)) continue;
    const failure = await pushLocalThread(client, userId, thread);
    if (failure) {
      if (!pushError) pushError = failure;
    } else {
      attemptedThreadPushes.add(thread.id);
    }
  }
  return pushError;
}

async function pushPendingReplies(
  client: RemoteClient,
  userId: string,
  threadId: string,
  page: ForumReply[],
): Promise<string | null> {
  for (const reply of page) attemptedReplyPushes.add(reply.id);
  const remoteIds = new Set(page.map((reply) => reply.id));
  const remoteKeys = new Set(page.map(replyIdentity));
  const pending = getReplies(threadId).filter(
    (reply) =>
      !remoteIds.has(reply.id) &&
      !remoteKeys.has(replyIdentity(reply)) &&
      !attemptedReplyPushes.has(reply.id),
  );
  let pushError: string | null = null;
  for (const reply of pending) {
    if (pushingReplies.has(reply.id)) continue;
    const failure = await pushLocalReply(client, userId, reply);
    if (failure) {
      if (!pushError) pushError = failure;
    } else {
      attemptedReplyPushes.add(reply.id);
    }
  }
  return pushError;
}

async function pushPendingComments(
  client: RemoteClient,
  userId: string,
  problemId: string,
  page: Comment[],
): Promise<string | null> {
  for (const comment of page) attemptedCommentPushes.add(comment.id);
  const remoteIds = new Set(page.map((comment) => comment.id));
  const remoteKeys = new Set(page.map(commentIdentity));
  const pending = getComments(problemId).filter(
    (comment) =>
      !remoteIds.has(comment.id) &&
      !remoteKeys.has(commentIdentity(comment)) &&
      !attemptedCommentPushes.has(comment.id),
  );
  let pushError: string | null = null;
  for (const comment of pending) {
    if (pushingComments.has(comment.id)) continue;
    const failure = await pushLocalComment(client, userId, comment);
    if (failure) {
      if (!pushError) pushError = failure;
    } else {
      attemptedCommentPushes.add(comment.id);
    }
  }
  return pushError;
}

function threadUpvoteState(id: string): SocialUpvoteState | null {
  const snapshot = getForumSnapshot();
  const thread = snapshot.threads.find((item) => item.id === id);
  if (!thread) return null;
  return {
    upvoted: snapshot.upvotedThreadIds.includes(id),
    upvotes: thread.upvotes,
  };
}

function replyUpvoteState(id: string): SocialUpvoteState | null {
  const snapshot = getForumSnapshot();
  const reply = snapshot.replies.find((item) => item.id === id);
  if (!reply) return null;
  return {
    upvoted: snapshot.upvotedReplyIds.includes(id),
    upvotes: reply.upvotes,
  };
}

export async function listThreads(
  options?: SocialPageOptions,
): Promise<SocialPageResult<ForumThread>> {
  ensureSessionWatch();
  const { offset, limit } = normalizePage(options);
  const local = () => getForumSnapshot().threads;
  const page = (
    remote: ForumThread[],
    error: string | null,
    hasMore = false,
  ): SocialPageResult<ForumThread> => ({
    data: local(),
    error,
    remote,
    hasMore,
    nextOffset: hasMore ? offset + remote.length : null,
  });
  const remote = await acquireRemote().catch(() => null);
  if (!remote) return page([], null);
  if ("error" in remote) return page([], remote.error);
  const { client, userId } = remote;
  const generation = currentGeneration();
  try {
    const remoteThreads = await fetchThreadPage(client, offset, limit);
    if (generation !== currentGeneration()) return page([], null);
    let pushError: string | null = null;
    if (offset === 0) {
      pushError = await pushPendingThreads(client, userId, remoteThreads);
      if (generation !== currentGeneration()) return page([], null);
    }
    mergeRemoteThreads(remoteThreads);
    if (offset === 0) {
      const upvotes = await fetchOwnUpvoteIds(client, userId);
      if (generation !== currentGeneration()) return page([], null);
      mergeRemoteUpvoteIds(upvotes.threadIds, upvotes.replyIds);
    }
    return page(remoteThreads, pushError, remoteThreads.length === limit);
  } catch (error) {
    return page([], errorMessage(error));
  }
}

export async function listReplies(
  threadId: string,
  options?: SocialPageOptions,
): Promise<SocialPageResult<ForumReply>> {
  ensureSessionWatch();
  const { offset, limit } = normalizePage(options);
  const local = () => getReplies(threadId);
  const page = (
    remote: ForumReply[],
    error: string | null,
    hasMore = false,
  ): SocialPageResult<ForumReply> => ({
    data: local(),
    error,
    remote,
    hasMore,
    nextOffset: hasMore ? offset + remote.length : null,
  });
  const remote = await acquireRemote().catch(() => null);
  if (!remote) return page([], null);
  if ("error" in remote) return page([], remote.error);
  const { client, userId } = remote;
  const generation = currentGeneration();
  try {
    const remoteReplies = await fetchReplyPage(client, threadId, offset, limit);
    if (generation !== currentGeneration()) return page([], null);
    let pushError: string | null = null;
    if (offset === 0) {
      pushError = await pushPendingReplies(client, userId, threadId, remoteReplies);
      if (generation !== currentGeneration()) return page([], null);
    }
    mergeRemoteReplies(remoteReplies);
    return page(remoteReplies, pushError, remoteReplies.length === limit);
  } catch (error) {
    return page([], errorMessage(error));
  }
}

export async function createThread(
  input: SocialThreadInput,
): Promise<SocialResult<ForumThread>> {
  ensureSessionWatch();
  const title = input.title.trim();
  const body = input.body.trim();
  const category =
    input.category && FORUM_CATEGORIES.includes(input.category)
      ? input.category
      : "General";
  const problemRefs = normalizeRefs(input.problemRefs, input.problemId);
  const localCreate = () => createLocalThread({ title, body, category, problemRefs });
  const remote = await acquireRemote().catch(() => null);
  if (!remote) {
    const thread = localCreate();
    notify();
    return { data: thread, error: null };
  }
  if ("error" in remote) {
    const thread = localCreate();
    notify();
    return { data: thread, error: remote.error };
  }
  const { client, userId } = remote;
  const thread: ForumThread = {
    id: makeId("ft"),
    title,
    body,
    category,
    author: cleanUsername(input.username),
    createdAt: new Date().toISOString(),
    upvotes: 0,
    problemRefs,
  };
  pushingThreads.add(thread.id);
  try {
    mergeRemoteThreads([thread]);
    notify();
    const { error } = await client
      .from("forum_threads")
      .insert(threadRow(thread, userId));
    if (error) throw error;
    return { data: thread, error: null };
  } catch (error) {
    return { data: thread, error: errorMessage(error) };
  } finally {
    pushingThreads.delete(thread.id);
  }
}

export async function createReply(
  input: SocialReplyInput,
): Promise<SocialResult<ForumReply>> {
  ensureSessionWatch();
  const body = input.body.trim();
  const localCreate = () => addReply(input.threadId, { body });
  const remote = await acquireRemote().catch(() => null);
  if (!remote) {
    const reply = localCreate();
    notify();
    return { data: reply, error: null };
  }
  if ("error" in remote) {
    const reply = localCreate();
    notify();
    return { data: reply, error: remote.error };
  }
  const { client, userId } = remote;
  const reply: ForumReply = {
    id: makeId("fr"),
    threadId: input.threadId,
    author: cleanUsername(input.username),
    body,
    createdAt: new Date().toISOString(),
    upvotes: 0,
  };
  pushingReplies.add(reply.id);
  try {
    mergeRemoteReplies([reply]);
    notify();
    const { error } = await client
      .from("forum_replies")
      .insert(replyRow(reply, userId));
    if (error) throw error;
    return { data: reply, error: null };
  } catch (error) {
    return { data: reply, error: errorMessage(error) };
  } finally {
    pushingReplies.delete(reply.id);
  }
}

export async function deleteThread(
  id: string,
): Promise<SocialResult<{ id: string }>> {
  ensureSessionWatch();
  const remote = await acquireRemote().catch(() => null);
  if (!remote) {
    deleteLocalThread(id);
    notify();
    return { data: { id }, error: null };
  }
  if ("error" in remote) return { data: null, error: remote.error };
  const { client } = remote;
  try {
    const query = client.from("forum_threads") as unknown as RemoteDeleteQuery;
    const { error } = await query.delete().eq("id", id);
    if (error) throw error;
    deleteLocalThread(id);
    notify();
    return { data: { id }, error: null };
  } catch (error) {
    return { data: null, error: errorMessage(error) };
  }
}

async function toggleUpvote(
  kind: "thread" | "reply",
  id: string,
): Promise<SocialResult<SocialUpvoteState>> {
  ensureSessionWatch();
  const toggleLocal = kind === "thread" ? upvoteLocalThread : upvoteLocalReply;
  const readState = kind === "thread" ? threadUpvoteState : replyUpvoteState;
  const key = `${kind}:${id}`;
  if (pendingUpvotes.has(key)) return { data: readState(id), error: null };
  const remote = await acquireRemote().catch(() => null);
  if (!remote) {
    toggleLocal(id);
    notify();
    return { data: readState(id), error: null };
  }
  if ("error" in remote) {
    toggleLocal(id);
    notify();
    return { data: readState(id), error: remote.error };
  }
  const { client } = remote;
  const rpc = rpcCall(client);
  const before = readState(id);
  pendingUpvotes.add(key);
  try {
    toggleLocal(id);
    notify();
    if (!rpc) throw new Error("Upvote sync is unavailable.");
    const { data, error } = await rpc(
      kind === "thread" ? "toggle_thread_upvote" : "toggle_reply_upvote",
      kind === "thread" ? { p_thread_id: id } : { p_reply_id: id },
    );
    if (error) throw error;
    if (typeof data === "number") {
      if (kind === "thread") setThreadUpvoteCount(id, data);
      else setReplyUpvoteCount(id, data);
    }
    notify();
    return { data: readState(id), error: null };
  } catch (error) {
    // Restore the exact pre-toggle state rather than re-toggling: a concurrent
    // merge may have changed the count while the RPC was in flight.
    if (before) {
      const current = readState(id);
      if (current && current.upvoted !== before.upvoted) toggleLocal(id);
      if (kind === "thread") setThreadUpvoteCount(id, before.upvotes);
      else setReplyUpvoteCount(id, before.upvotes);
    }
    notify();
    return { data: null, error: errorMessage(error) };
  } finally {
    pendingUpvotes.delete(key);
  }
}

export function toggleThreadUpvote(
  threadId: string,
): Promise<SocialResult<SocialUpvoteState>> {
  return toggleUpvote("thread", threadId);
}

export function toggleReplyUpvote(
  replyId: string,
): Promise<SocialResult<SocialUpvoteState>> {
  return toggleUpvote("reply", replyId);
}

export async function listComments(
  problemId: string,
  options?: SocialPageOptions,
): Promise<SocialPageResult<Comment>> {
  ensureSessionWatch();
  const { offset, limit } = normalizePage(options);
  const local = () => getComments(problemId);
  const page = (
    remote: Comment[],
    error: string | null,
    hasMore = false,
  ): SocialPageResult<Comment> => ({
    data: local(),
    error,
    remote,
    hasMore,
    nextOffset: hasMore ? offset + remote.length : null,
  });
  const remote = await acquireRemote().catch(() => null);
  if (!remote) return page([], null);
  if ("error" in remote) return page([], remote.error);
  const { client, userId } = remote;
  const generation = currentGeneration();
  try {
    const [rows, upvoteRows] = await Promise.all([
      pageQuery(client.from("comments"))
        .select(COMMENT_COLUMNS)
        .eq("problem_id", problemId)
        .order("created_at", { ascending: false })
        .order("id", { ascending: false })
        .range(offset, offset + limit - 1),
      client.from("comment_upvotes").select("comment_id").eq("user_id", userId),
    ]);
    if (rows.error) throw rows.error;
    if (generation !== currentGeneration()) return page([], null);
    const upvoted = new Set(upvoteRows.error ? [] : idsFromRows(upvoteRows.data, "comment_id"));
    const remoteComments = (Array.isArray(rows.data) ? rows.data : [])
      .map((row) => mapCommentRow(row, false))
      .filter((comment): comment is Comment => comment !== null)
      .map((comment) => ({ ...comment, upvotedByMe: upvoted.has(comment.id) }));
    let pushError: string | null = null;
    if (offset === 0) {
      pushError = await pushPendingComments(client, userId, problemId, remoteComments);
      if (generation !== currentGeneration()) return page([], null);
    }
    mergeRemoteComments(problemId, remoteComments);
    return page(remoteComments, pushError, remoteComments.length === limit);
  } catch (error) {
    return page([], errorMessage(error));
  }
}

export async function createComment(
  input: SocialCommentInput,
): Promise<SocialResult<Comment>> {
  ensureSessionWatch();
  const body = input.body.trim();
  const localCreate = () => addComment(input.problemId, body);
  const remote = await acquireRemote().catch(() => null);
  if (!remote) {
    const comment = localCreate();
    notify();
    return { data: comment, error: null };
  }
  if ("error" in remote) {
    const comment = localCreate();
    notify();
    return { data: comment, error: remote.error };
  }
  const { client, userId } = remote;
  const comment: Comment = {
    id: makeId("c"),
    problemId: input.problemId,
    author: cleanUsername(input.username),
    body,
    createdAt: new Date().toISOString(),
    upvotes: 0,
    upvotedByMe: false,
  };
  pushingComments.add(comment.id);
  try {
    mergeRemoteComments(input.problemId, [comment]);
    notify();
    const { error } = await client
      .from("comments")
      .insert(commentRow(comment, userId));
    if (error) throw error;
    return { data: comment, error: null };
  } catch (error) {
    return { data: comment, error: errorMessage(error) };
  } finally {
    pushingComments.delete(comment.id);
  }
}

export const MAX_COMMENT_LENGTH = 2000;

const COMMENT_STORAGE_KEY = "deepforge:comments:v1";

const commentProblems = new Map<string, string>();

function storedCommentProblem(commentId: string): string | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(COMMENT_STORAGE_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return null;
    }
    for (const [problemId, list] of Object.entries(
      parsed as Record<string, unknown>,
    )) {
      if (!Array.isArray(list)) continue;
      for (const item of list) {
        if (item && typeof item === "object" && (item as Row).id === commentId) {
          return problemId;
        }
      }
    }
  } catch {
    return null;
  }
  return null;
}

function commentProblemId(commentId: string): string | null {
  const cached = commentProblems.get(commentId);
  if (cached) return cached;
  const found = storedCommentProblem(commentId);
  if (found) commentProblems.set(commentId, found);
  return found;
}

function commentUpvoteState(commentId: string): SocialUpvoteState | null {
  const problemId = commentProblemId(commentId);
  if (!problemId) return null;
  const comment = getComments(problemId).find((item) => item.id === commentId);
  if (!comment) return null;
  return { upvoted: comment.upvotedByMe, upvotes: comment.upvotes };
}

function toggleLocalCommentUpvote(commentId: string): void {
  const problemId = commentProblemId(commentId);
  if (!problemId) return;
  toggleLocalCommentVote(problemId, commentId);
}

function adoptCommentUpvoteCount(commentId: string, count: number): void {
  if (typeof count !== "number" || !Number.isFinite(count)) return;
  const problemId = commentProblemId(commentId);
  if (!problemId) return;
  const comment = getComments(problemId).find((item) => item.id === commentId);
  if (!comment) return;
  mergeRemoteComments(problemId, [
    { ...comment, upvotes: Math.max(0, Math.floor(count)) },
  ]);
}

async function toggleCommentUpvoteById(
  commentId: string,
): Promise<SocialResult<SocialUpvoteState>> {
  ensureSessionWatch();
  const key = `comment:${commentId}`;
  if (pendingUpvotes.has(key)) {
    return { data: commentUpvoteState(commentId), error: null };
  }
  const remote = await acquireRemote().catch(() => null);
  if (!remote) {
    toggleLocalCommentUpvote(commentId);
    notify();
    return { data: commentUpvoteState(commentId), error: null };
  }
  if ("error" in remote) {
    toggleLocalCommentUpvote(commentId);
    notify();
    return { data: commentUpvoteState(commentId), error: remote.error };
  }
  const { client } = remote;
  const rpc = rpcCall(client);
  const before = commentUpvoteState(commentId);
  pendingUpvotes.add(key);
  try {
    toggleLocalCommentUpvote(commentId);
    notify();
    if (!rpc) throw new Error("Upvote sync is unavailable.");
    const { data, error } = await rpc("toggle_comment_upvote", {
      p_comment_id: commentId,
    });
    if (error) throw error;
    if (typeof data === "number") adoptCommentUpvoteCount(commentId, data);
    notify();
    return { data: commentUpvoteState(commentId), error: null };
  } catch (error) {
    if (before) {
      const current = commentUpvoteState(commentId);
      if (current && current.upvoted !== before.upvoted) {
        toggleLocalCommentUpvote(commentId);
      }
      adoptCommentUpvoteCount(commentId, before.upvotes);
    }
    notify();
    return { data: null, error: errorMessage(error) };
  } finally {
    pendingUpvotes.delete(key);
  }
}

export function toggleCommentUpvote(
  commentId: string,
): Promise<SocialResult<SocialUpvoteState>> {
  return toggleCommentUpvoteById(commentId);
}

/* ─────────────────────────────── realtime ──────────────────────────────── */

export type SocialRealtimeTopic =
  | { kind: "threads" }
  | { kind: "replies"; threadId: string }
  | { kind: "comments"; problemId: string }
  | { kind: "group"; groupId: string };

interface RealtimePayload {
  new?: unknown;
}

interface RealtimeChannelLike {
  on(
    type: "postgres_changes",
    filter: {
      event: string;
      schema: string;
      table: string;
      filter?: string;
    },
    callback: (payload: RealtimePayload) => void,
  ): RealtimeChannelLike;
  subscribe(callback?: (status: string) => void): RealtimeChannelLike;
  unsubscribe?(): unknown;
}

interface RealtimeClientLike {
  channel?(name: string): RealtimeChannelLike;
  removeChannel?(channel: RealtimeChannelLike): unknown;
}

let realtimeChannelSeq = 0;

/**
 * Realtime is on by default; `NEXT_PUBLIC_SOCIAL_REALTIME=0` disables it and
 * leaves the app on the local/refresh path (used by deployments that cannot
 * afford websocket connections).
 */
export function isSocialRealtimeEnabled(): boolean {
  return process.env.NEXT_PUBLIC_SOCIAL_REALTIME !== "0";
}

function realtimeTable(topic: SocialRealtimeTopic): string {
  if (topic.kind === "threads") return "forum_threads";
  if (topic.kind === "replies") return "forum_replies";
  if (topic.kind === "comments") return "comments";
  return "group_nudges";
}

function realtimeFilter(topic: SocialRealtimeTopic): string | undefined {
  if (topic.kind === "replies") return `thread_id=eq.${topic.threadId}`;
  if (topic.kind === "comments") return `problem_id=eq.${topic.problemId}`;
  if (topic.kind === "group") return `group_id=eq.${topic.groupId}`;
  return undefined;
}

function mergeRealtimeRow(topic: SocialRealtimeTopic, row: unknown): void {
  if (!row) return;
  if (topic.kind === "threads") {
    const thread = mapThreadRow(row);
    if (thread) mergeRemoteThreads([thread]);
    return;
  }
  if (topic.kind === "replies") {
    const reply = mapReplyRow(row);
    if (reply && reply.threadId === topic.threadId) mergeRemoteReplies([reply]);
    return;
  }
  if (topic.kind === "comments") {
    const comment = mapCommentRow(row, false);
    if (comment && comment.problemId === topic.problemId) {
      mergeRemoteComments(topic.problemId, [comment]);
    }
    return;
  }
  const nudge = mapNudgeRow(row);
  if (nudge && nudge.groupId === topic.groupId) mergeCachedNudges([nudge]);
}

/**
 * Best-effort `postgres_changes` subscription for one social topic. Rows are
 * merged straight into the local store (which dedupes by id), so live inserts
 * — including echoes of our own optimistic writes — never duplicate.
 *
 * Returns a synchronous unsubscribe handle: it tears the channel down on
 * unmount/topic switch, detaches while signed out, and re-attaches when a
 * session appears. When the client, the package, or the feature flag is
 * unavailable, the handle is a no-op and callers keep the refresh path.
 */
export function subscribeRealtime(topic: SocialRealtimeTopic): () => void {
  if (!isSocialRealtimeEnabled()) return () => {};
  ensureSessionWatch();
  let disposed = false;
  let detachChannel: (() => void) | null = null;
  let attaching = false;

  const detach = () => {
    const fn = detachChannel;
    detachChannel = null;
    if (!fn) return;
    try {
      fn();
    } catch {
      /* teardown is best-effort */
    }
  };

  const attach = async () => {
    if (attaching || detachChannel || disposed) return;
    attaching = true;
    try {
      const client = await getRemoteClient();
      if (!client || disposed || !isRemoteActive()) return;
      const rt = client as unknown as RealtimeClientLike;
      if (typeof rt.channel !== "function") return;
      const channel = rt.channel(
        `deepforge-social-${topic.kind}-${++realtimeChannelSeq}`,
      );
      const filter = realtimeFilter(topic);
      const scope = {
        schema: "public",
        table: realtimeTable(topic),
        ...(filter ? { filter } : {}),
      };
      const receive = (payload: RealtimePayload) => {
        if (disposed) return;
        mergeRealtimeRow(topic, payload?.new);
      };
      channel
        .on("postgres_changes", { event: "INSERT", ...scope }, receive)
        .on("postgres_changes", { event: "UPDATE", ...scope }, receive);
      if (topic.kind === "group") {
        // A group surface wants both nudge rows and aggregate updates.
        const activityScope = {
          schema: "public",
          table: "group_activity",
          filter: `group_id=eq.${topic.groupId}`,
        };
        const receiveActivity = (payload: RealtimePayload) => {
          if (disposed) return;
          mergeRealtimeActivity(topic.groupId, payload?.new);
        };
        channel
          .on("postgres_changes", { event: "INSERT", ...activityScope }, receiveActivity)
          .on("postgres_changes", { event: "UPDATE", ...activityScope }, receiveActivity);
      }
      channel.subscribe();
      detachChannel = () => {
        if (typeof channel.unsubscribe === "function") {
          channel.unsubscribe();
          return;
        }
        if (typeof rt.removeChannel === "function") rt.removeChannel(channel);
      };
      if (disposed) detach();
    } catch {
      /* realtime is best-effort — the local path stays authoritative */
    } finally {
      attaching = false;
    }
  };

  const sync = () => {
    if (disposed) return;
    if (isRemoteActive()) void attach();
    else detach();
  };

  const stopSessionWatch = onSessionChange(() => sync());
  sync();

  return () => {
    disposed = true;
    stopSessionWatch();
    detach();
  };
}


/* ────────────────────────────── study groups ────────────────────────────── */

/**
 * Study groups are local-first like everything else in this file:
 *
 *   * the last-known group list, members, and nudge log live in one
 *     localStorage snapshot (`deepforge:groups:v1`) and render synchronously;
 *   * remote reads/writes only run when Supabase is configured AND a session
 *     is cached — signed out, groups stay a local-only view;
 *   * when a remote write fails the local form still works (a group is kept
 *     as "on this device"), but nudges are never recorded locally unless the
 *     insert succeeded, so no phantom writes are queued.
 *
 * Privacy: the only per-member signal shared with a group is an aggregate —
 * weekly solved count, current streak, last-active time. Raw problem ids and
 * code never leave the device.
 */

const GROUPS_STORAGE_KEY = "deepforge:groups:v1";

/** Dispatched after any local group/member/nudge cache write. */
export const GROUPS_CHANGE_EVENT = "deepforge:groups-change";

/** Minimum gap between two nudges from the same sender to the same person. */
export const NUDGE_COOLDOWN_MS = 12 * 60 * 60 * 1000;

/** Synthetic member id used by signed-out, local-only groups. */
const LOCAL_USER_ID = "local";

const MAX_CACHED_NUDGES = 200;

const GROUP_COLUMNS =
  "id, name, topic, path_ref, join_code, owner_id, created_at, updated_at";
const MEMBER_COLUMNS = "group_id, user_id, role, joined_at";
const ACTIVITY_COLUMNS =
  "user_id, week_start, solved_count, streak, last_active_at";
const NUDGE_COLUMNS = "id, group_id, from_user, to_user, created_at, seen";

export interface StudyGroup {
  id: string;
  name: string;
  topic: string | null;
  pathRef: string | null;
  joinCode: string;
  /** Remote owner id; null for local-only groups. */
  ownerId: string | null;
  createdAt: string;
  /** True when the group exists only in this browser's storage. */
  localOnly: boolean;
}

export interface GroupMemberInfo {
  userId: string;
  username: string | null;
  role: "owner" | "member";
  joinedAt: string;
  /** Aggregate solved count for the current week. */
  weeklySolved: number;
  /** Current daily streak, recency-aware. */
  streak: number;
  lastActiveAt: string | null;
  isYou: boolean;
}

export interface GroupLeaderboard {
  groupId: string;
  /** Monday of the current week, "YYYY-MM-DD". */
  weekStart: string;
  members: GroupMemberInfo[];
  /** Shortest active member streak; 0 while anyone is inactive. */
  groupStreak: number;
  activeMembers: number;
}

export interface GroupNudge {
  id: string;
  groupId: string;
  fromUser: string;
  toUser: string;
  createdAt: string;
  seen: boolean;
}

export interface StudyGroupInput {
  name: string;
  topic?: string;
  pathRef?: string;
}

export interface GroupSnapshot {
  groups: StudyGroup[];
  members: Record<string, GroupMemberInfo[]>;
  nudges: GroupNudge[];
}

type GroupsCache = GroupSnapshot;

interface RemoteGroupQuery extends PromiseLike<RemoteResult<unknown>> {
  select(columns?: string): RemoteGroupQuery;
  eq(column: string, value: unknown): RemoteGroupQuery;
  in(column: string, values: readonly unknown[]): RemoteGroupQuery;
}

interface RemoteDeleteChain extends PromiseLike<RemoteResult<unknown>> {
  eq(column: string, value: unknown): RemoteDeleteChain;
}

interface RemoteDeleteQuery {
  delete(): RemoteDeleteChain;
}

function groupQuery(source: unknown): RemoteGroupQuery {
  return source as RemoteGroupQuery;
}

/* ───────────────────────────── local cache ──────────────────────────────── */

let groupSnapshotCache: GroupSnapshot | null = null;
let groupSnapshotRaw: string | null = null;

function emptyGroupsCache(): GroupsCache {
  return { groups: [], members: {}, nudges: [] };
}

function cleanOptional(value: string | null | undefined, max: number): string | null {
  if (typeof value !== "string") return null;
  const text = value.trim().slice(0, max);
  return text || null;
}

function parseCachedGroup(value: unknown): StudyGroup | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const row = value as Row;
  const id = stringValue(row.id);
  const name = stringValue(row.name);
  if (!id || !name) return null;
  return {
    id,
    name,
    topic: stringValue(row.topic),
    pathRef: stringValue(row.pathRef),
    joinCode: stringValue(row.joinCode) ?? "",
    ownerId: stringValue(row.ownerId),
    createdAt: stringValue(row.createdAt) ?? "",
    localOnly: row.localOnly === true,
  };
}

function parseCachedMember(value: unknown): GroupMemberInfo | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const row = value as Row;
  const userId = stringValue(row.userId);
  if (!userId) return null;
  return {
    userId,
    username: stringValue(row.username),
    role: row.role === "owner" ? "owner" : "member",
    joinedAt: stringValue(row.joinedAt) ?? "",
    weeklySolved: numberValue(row.weeklySolved),
    streak: numberValue(row.streak),
    lastActiveAt: stringValue(row.lastActiveAt),
    isYou: row.isYou === true,
  };
}

function parseCachedNudge(value: unknown): GroupNudge | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const row = value as Row;
  const id = stringValue(row.id);
  const groupId = stringValue(row.groupId);
  const fromUser = stringValue(row.fromUser);
  const toUser = stringValue(row.toUser);
  if (!id || !groupId || !fromUser || !toUser) return null;
  return {
    id,
    groupId,
    fromUser,
    toUser,
    createdAt: stringValue(row.createdAt) ?? "",
    seen: row.seen === true,
  };
}

function parseGroupsCache(raw: string | null): GroupsCache {
  if (!raw) return emptyGroupsCache();
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return emptyGroupsCache();
    }
    const value = parsed as Row;
    const groups = Array.isArray(value.groups)
      ? value.groups
          .map(parseCachedGroup)
          .filter((group): group is StudyGroup => group !== null)
      : [];
    const members: Record<string, GroupMemberInfo[]> = {};
    if (value.members && typeof value.members === "object" && !Array.isArray(value.members)) {
      for (const [groupId, list] of Object.entries(value.members as Row)) {
        if (!Array.isArray(list)) continue;
        members[groupId] = list
          .map(parseCachedMember)
          .filter((member): member is GroupMemberInfo => member !== null);
      }
    }
    const nudges = Array.isArray(value.nudges)
      ? value.nudges
          .map(parseCachedNudge)
          .filter((nudge): nudge is GroupNudge => nudge !== null)
      : [];
    return { groups, members, nudges };
  } catch {
    return emptyGroupsCache();
  }
}

/** Synchronous, SSR-safe view for `useSyncExternalStore` consumers. */
export function getGroupSnapshot(): GroupSnapshot {
  // Re-read the raw string: it is cheap, keeps referential stability while
  // unchanged, and stays correct if storage is swapped (tests, other tabs).
  const raw = readRaw(GROUPS_STORAGE_KEY);
  if (groupSnapshotCache === null || raw !== groupSnapshotRaw) {
    groupSnapshotCache = parseGroupsCache(raw);
    groupSnapshotRaw = raw;
  }
  return groupSnapshotCache;
}

export function subscribeGroups(callback: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  window.addEventListener(GROUPS_CHANGE_EVENT, callback);
  return () => window.removeEventListener(GROUPS_CHANGE_EVENT, callback);
}

function dispatchGroupsChange(): void {
  try {
    if (typeof window === "undefined") return;
    if (typeof CustomEvent !== "function") return;
    window.dispatchEvent(new CustomEvent(GROUPS_CHANGE_EVENT));
  } catch {
    /* events unavailable — cache is still updated */
  }
}

function writeGroupsCache(cache: GroupsCache): void {
  const raw = JSON.stringify(cache);
  writeRaw(GROUPS_STORAGE_KEY, raw);
  groupSnapshotCache = cache;
  groupSnapshotRaw = raw;
  dispatchGroupsChange();
}

function sameGroup(a: StudyGroup, b: StudyGroup): boolean {
  return (
    a.id === b.id &&
    a.name === b.name &&
    a.topic === b.topic &&
    a.pathRef === b.pathRef &&
    a.joinCode === b.joinCode &&
    a.ownerId === b.ownerId &&
    a.createdAt === b.createdAt &&
    a.localOnly === b.localOnly
  );
}

function sameMember(a: GroupMemberInfo, b: GroupMemberInfo): boolean {
  return (
    a.userId === b.userId &&
    a.username === b.username &&
    a.role === b.role &&
    a.joinedAt === b.joinedAt &&
    a.weeklySolved === b.weeklySolved &&
    a.streak === b.streak &&
    a.lastActiveAt === b.lastActiveAt &&
    a.isYou === b.isYou
  );
}

function sameNudge(a: GroupNudge, b: GroupNudge): boolean {
  return (
    a.id === b.id &&
    a.groupId === b.groupId &&
    a.fromUser === b.fromUser &&
    a.toUser === b.toUser &&
    a.createdAt === b.createdAt &&
    a.seen === b.seen
  );
}

/** Insert or refresh cached groups; notifies only when something changed. */
function upsertCachedGroups(groups: StudyGroup[]): void {
  if (groups.length === 0) return;
  const cache = parseGroupsCache(readRaw(GROUPS_STORAGE_KEY));
  let changed = false;
  for (const group of groups) {
    const index = cache.groups.findIndex((existing) => existing.id === group.id);
    if (index === -1) {
      cache.groups.push(group);
      changed = true;
    } else if (!sameGroup(cache.groups[index], group)) {
      cache.groups[index] = group;
      changed = true;
    }
  }
  if (changed) writeGroupsCache(cache);
}

function removeCachedGroup(groupId: string): void {
  const cache = parseGroupsCache(readRaw(GROUPS_STORAGE_KEY));
  const groups = cache.groups.filter((group) => group.id !== groupId);
  if (groups.length === cache.groups.length) return;
  const members = { ...cache.members };
  delete members[groupId];
  writeGroupsCache({
    groups,
    members,
    nudges: cache.nudges.filter((nudge) => nudge.groupId !== groupId),
  });
}

function setCachedMembers(groupId: string, members: GroupMemberInfo[]): void {
  const cache = parseGroupsCache(readRaw(GROUPS_STORAGE_KEY));
  const current = cache.members[groupId] ?? [];
  if (
    current.length === members.length &&
    current.every((member, index) => sameMember(member, members[index]))
  ) {
    return;
  }
  writeGroupsCache({ ...cache, members: { ...cache.members, [groupId]: members } });
}

function mergeCachedNudges(rows: GroupNudge[]): void {
  if (rows.length === 0) return;
  const cache = parseGroupsCache(readRaw(GROUPS_STORAGE_KEY));
  const byId = new Map(cache.nudges.map((nudge) => [nudge.id, nudge]));
  let changed = false;
  for (const row of rows) {
    const existing = byId.get(row.id);
    if (!existing) {
      byId.set(row.id, row);
      changed = true;
    } else if (!sameNudge(existing, row)) {
      byId.set(row.id, row);
      changed = true;
    }
  }
  if (!changed) return;
  const nudges = [...byId.values()]
    .sort(
      (a, b) =>
        b.createdAt.localeCompare(a.createdAt) || b.id.localeCompare(a.id),
    )
    .slice(0, MAX_CACHED_NUDGES);
  writeGroupsCache({ ...cache, nudges });
}

function setCachedNudgeSeen(nudgeId: string): void {
  const cache = parseGroupsCache(readRaw(GROUPS_STORAGE_KEY));
  let changed = false;
  const nudges = cache.nudges.map((nudge) => {
    if (nudge.id !== nudgeId || nudge.seen) return nudge;
    changed = true;
    return { ...nudge, seen: true };
  });
  if (changed) writeGroupsCache({ ...cache, nudges });
}

/* ──────────────────────────── weekly aggregates ─────────────────────────── */

function shiftDays(d: Date, days: number): Date {
  const copy = new Date(d);
  copy.setDate(copy.getDate() + days);
  return copy;
}

/** Monday of the week containing `d`, as a local "YYYY-MM-DD" key. */
export function startOfWeekKey(d = new Date()): string {
  const copy = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const mondayOffset = (copy.getDay() + 6) % 7;
  copy.setDate(copy.getDate() - mondayOffset);
  return getDailyDateKey(copy);
}

/** Problems whose first solve falls in [weekStart, today], local dates. */
export function weeklySolvedCount(
  progress: ProgressMap,
  weekStart: string,
  d = new Date(),
): number {
  const today = getDailyDateKey(d);
  let count = 0;
  for (const entry of Object.values(progress)) {
    if (!entry?.solved || !entry.solvedAt) continue;
    const solved = new Date(entry.solvedAt);
    if (Number.isNaN(solved.getTime())) continue;
    const key = getDailyDateKey(solved);
    if (key >= weekStart && key <= today) count += 1;
  }
  return count;
}

/**
 * Current daily streak, recency-aware: a stored streak only counts while the
 * last active day is today or yesterday (a shield-covered day moves
 * `lastSolvedDate` forward without adding a solve, which is exactly how
 * `daily.ts` keeps the run alive).
 */
export function currentDailyStreak(d = new Date()): number {
  const state = getDailyState();
  if (!state.lastSolvedDate) return 0;
  const today = getDailyDateKey(d);
  const yesterday = getDailyDateKey(shiftDays(d, -1));
  if (state.lastSolvedDate !== today && state.lastSolvedDate !== yesterday) {
    return 0;
  }
  return Math.max(0, Math.floor(state.streak));
}

function latestSolveAt(): string | null {
  let latest = 0;
  for (const entry of Object.values(getProgress())) {
    if (!entry?.solvedAt) continue;
    const at = Date.parse(entry.solvedAt);
    if (!Number.isNaN(at) && at > latest) latest = at;
  }
  if (latest > 0) return new Date(latest).toISOString();
  const state = getDailyState();
  return state.lastSolvedDate ? `${state.lastSolvedDate}T12:00:00.000Z` : null;
}

export interface GroupActivitySignal {
  weeklySolved: number;
  streak: number;
  lastActiveAt: string | null;
}

/** The aggregate signal this device publishes for the current user. */
export function selfGroupActivity(): GroupActivitySignal {
  return {
    weeklySolved: weeklySolvedCount(getProgress(), startOfWeekKey()),
    streak: currentDailyStreak(),
    lastActiveAt: latestSolveAt(),
  };
}

/** The id local-only groups attribute to this device's owner. */
export function getGroupSelfId(): string {
  return getCachedSession()?.userId ?? LOCAL_USER_ID;
}

function selfMemberInfo(): GroupMemberInfo {
  const activity = selfGroupActivity();
  return {
    userId: getGroupSelfId(),
    username: getUserName(),
    role: "member",
    joinedAt: "",
    weeklySolved: activity.weeklySolved,
    streak: activity.streak,
    lastActiveAt: activity.lastActiveAt,
    isYou: true,
  };
}

/**
 * Group streak follows the shortest member run: every member must have an
 * active streak for the group to be on streak, so one missed day ends it.
 */
export function groupStreakFromMembers(
  members: Pick<GroupMemberInfo, "streak" | "lastActiveAt">[],
): number {
  if (members.length === 0) return 0;
  let weakest = Number.POSITIVE_INFINITY;
  for (const member of members) {
    if (!member.lastActiveAt || member.streak <= 0) return 0;
    weakest = Math.min(weakest, Math.floor(member.streak));
  }
  return Number.isFinite(weakest) ? weakest : 0;
}

function compareMembers(a: GroupMemberInfo, b: GroupMemberInfo): number {
  if (b.weeklySolved !== a.weeklySolved) return b.weeklySolved - a.weeklySolved;
  if (b.streak !== a.streak) return b.streak - a.streak;
  if (a.isYou !== b.isYou) return a.isYou ? -1 : 1;
  return (a.username ?? "").localeCompare(b.username ?? "");
}

/**
 * Derive the weekly board from the local snapshot. The signed-in user's row
 * is always recomputed from local progress, so the board updates instantly
 * after a solve and never depends on a round trip.
 */
export function buildGroupBoard(
  groupId: string,
  snapshot: GroupSnapshot = getGroupSnapshot(),
): GroupLeaderboard | null {
  const group = snapshot.groups.find((item) => item.id === groupId);
  if (!group) return null;
  const cached = snapshot.members[groupId] ?? [];
  const selfId = getGroupSelfId();
  const cachedSelf = cached.find((member) => member.userId === selfId);
  const others = cached.filter(
    (member) => member.userId !== selfId && !member.isYou,
  );
  const self: GroupMemberInfo = {
    ...selfMemberInfo(),
    role:
      cachedSelf?.role ??
      (group.ownerId !== null && group.ownerId === selfId ? "owner" : "member"),
    joinedAt: cachedSelf?.joinedAt ?? "",
  };
  const members = [...others, self].sort(compareMembers);
  return {
    groupId,
    weekStart: startOfWeekKey(),
    members,
    groupStreak: groupStreakFromMembers(members),
    activeMembers: members.filter((member) => Boolean(member.lastActiveAt)).length,
  };
}

/** Convenience wrapper for component render paths. */
export function getGroupBoard(groupId: string): GroupLeaderboard | null {
  return buildGroupBoard(groupId);
}

/* ─────────────────────────────── mapping ────────────────────────────────── */

function numberValue(value: unknown): number {
  return typeof value === "number" && Number.isFinite(value)
    ? Math.max(0, Math.floor(value))
    : 0;
}

function mapStudyGroupRow(row: unknown): StudyGroup | null {
  if (!row || typeof row !== "object") return null;
  const value = row as Row;
  const id = stringValue(value.id);
  const name = stringValue(value.name);
  if (!id || !name) return null;
  return {
    id,
    name,
    topic: stringValue(value.topic),
    pathRef: stringValue(value.path_ref),
    joinCode: stringValue(value.join_code) ?? "",
    ownerId: stringValue(value.owner_id),
    createdAt: stringValue(value.created_at) ?? "",
    localOnly: false,
  };
}

function mapMemberRow(
  row: unknown,
  activity: Row | undefined,
  username: string | null,
  selfId: string,
): GroupMemberInfo | null {
  if (!row || typeof row !== "object") return null;
  const value = row as Row;
  const userId = stringValue(value.user_id);
  if (!userId) return null;
  return {
    userId,
    username,
    role: value.role === "owner" ? "owner" : "member",
    joinedAt: stringValue(value.joined_at) ?? "",
    weeklySolved: numberValue(activity?.solved_count),
    streak: numberValue(activity?.streak),
    lastActiveAt: stringValue(activity?.last_active_at),
    isYou: userId === selfId,
  };
}

function mapNudgeRow(row: unknown): GroupNudge | null {
  if (!row || typeof row !== "object") return null;
  const value = row as Row;
  const id = stringValue(value.id);
  const groupId = stringValue(value.group_id);
  const fromUser = stringValue(value.from_user);
  const toUser = stringValue(value.to_user);
  if (!id || !groupId || !fromUser || !toUser) return null;
  return {
    id,
    groupId,
    fromUser,
    toUser,
    createdAt: stringValue(value.created_at) ?? "",
    seen: value.seen === true,
  };
}

function namesFromRows(data: unknown): Record<string, string> {
  const names: Record<string, string> = {};
  if (!Array.isArray(data)) return names;
  for (const row of data) {
    if (!row || typeof row !== "object") continue;
    const id = stringValue((row as Row).id);
    const username = stringValue((row as Row).username);
    if (id && username) names[id] = username;
  }
  return names;
}

function firstRow(data: unknown): unknown {
  if (Array.isArray(data)) return data[0] ?? null;
  return data ?? null;
}

/* ─────────────────────────────── joins codes ────────────────────────────── */

const JOIN_CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

/** 8 characters from an unambiguous alphabet (no 0/O/1/I). */
export function makeJoinCode(length = 8): string {
  let code = "";
  for (let i = 0; i < length; i += 1) {
    code += JOIN_CODE_ALPHABET[Math.floor(Math.random() * JOIN_CODE_ALPHABET.length)];
  }
  return code;
}

function normalizeJoinCode(input: string): string {
  return input
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .slice(0, 16);
}

function localGroup(input: {
  name: string;
  topic: string | null;
  pathRef: string | null;
  joinCode: string;
}): StudyGroup {
  return {
    id: makeId("grp"),
    name: input.name,
    topic: input.topic,
    pathRef: input.pathRef,
    joinCode: input.joinCode,
    ownerId: null,
    createdAt: new Date().toISOString(),
    localOnly: true,
  };
}

/* ───────────────────────────── remote helpers ───────────────────────────── */

async function fetchGroupMembers(
  client: RemoteClient,
  groupId: string,
  weekStart: string,
  selfId: string,
): Promise<GroupMemberInfo[]> {
  const [memberRows, activityRows] = await Promise.all([
    groupQuery(client.from("group_members"))
      .select(MEMBER_COLUMNS)
      .eq("group_id", groupId),
    groupQuery(client.from("group_activity"))
      .select(ACTIVITY_COLUMNS)
      .eq("group_id", groupId)
      .eq("week_start", weekStart),
  ]);
  if (memberRows.error) throw memberRows.error;
  if (activityRows.error) throw activityRows.error;

  const members = Array.isArray(memberRows.data) ? memberRows.data : [];
  const activity = new Map<string, Row>();
  for (const row of Array.isArray(activityRows.data) ? activityRows.data : []) {
    if (!row || typeof row !== "object") continue;
    const userId = stringValue((row as Row).user_id);
    if (userId) activity.set(userId, row as Row);
  }

  const ids = members
    .map((row) =>
      row && typeof row === "object" ? stringValue((row as Row).user_id) : null,
    )
    .filter((id): id is string => id !== null);
  let names: Record<string, string> = {};
  if (ids.length > 0) {
    const profileRows = await groupQuery(client.from("profiles"))
      .select("id, username")
      .in("id", ids);
    if (!profileRows.error) names = namesFromRows(profileRows.data);
  }

  return members
    .map((row) => {
      const userId =
        row && typeof row === "object" ? stringValue((row as Row).user_id) : null;
      return mapMemberRow(
        row,
        userId ? activity.get(userId) : undefined,
        userId ? (names[userId] ?? null) : null,
        selfId,
      );
    })
    .filter((member): member is GroupMemberInfo => member !== null);
}

/** Publish this device's aggregate for one group. Best-effort by contract. */
async function pushSelfActivity(
  client: RemoteClient,
  groupId: string,
  weekStart: string,
): Promise<void> {
  const userId = getCachedSession()?.userId;
  if (!userId) return;
  const activity = selfGroupActivity();
  const { error } = await client.from("group_activity").upsert(
    {
      group_id: groupId,
      user_id: userId,
      week_start: weekStart,
      solved_count: activity.weeklySolved,
      streak: activity.streak,
      last_active_at: activity.lastActiveAt,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "group_id,user_id,week_start" },
  );
  if (error) throw error;
}

/* ───────────────────────────── public API ───────────────────────────────── */

function sortedGroups(groups: StudyGroup[]): StudyGroup[] {
  return [...groups].sort(
    (a, b) => a.createdAt.localeCompare(b.createdAt) || a.name.localeCompare(b.name),
  );
}

/**
 * List groups this device knows about. Always resolves with the local
 * snapshot; when signed in it refreshes from membership + group rows and
 * reports remote failures without dropping the local view.
 */
export async function listMyGroups(): Promise<SocialResult<StudyGroup[]>> {
  ensureSessionWatch();
  const local = () => sortedGroups(getGroupSnapshot().groups);
  const remote = await acquireRemote().catch(() => null);
  if (!remote) return { data: local(), error: null };
  if ("error" in remote) return { data: local(), error: remote.error };
  const { client, userId } = remote;
  const generation = currentGeneration();
  try {
    const memberships = await groupQuery(client.from("group_members"))
      .select("group_id, role, joined_at")
      .eq("user_id", userId);
    if (memberships.error) throw memberships.error;
    const ids = idsFromRows(memberships.data, "group_id");
    if (ids.length > 0) {
      const rows = await groupQuery(client.from("study_groups"))
        .select(GROUP_COLUMNS)
        .in("id", ids);
      if (rows.error) throw rows.error;
      if (generation !== currentGeneration()) return { data: local(), error: null };
      const groups = (Array.isArray(rows.data) ? rows.data : [])
        .map(mapStudyGroupRow)
        .filter((group): group is StudyGroup => group !== null);
      upsertCachedGroups(groups);
    }
    return { data: local(), error: null };
  } catch (error) {
    return { data: local(), error: errorMessage(error) };
  }
}

/**
 * Create a group. Signed out this is a local-only group ("on this device").
 * When signed in it goes through `create_study_group`, which also seeds the
 * owner membership; on failure the draft is kept locally with the error.
 */
export async function createGroup(
  input: StudyGroupInput,
): Promise<SocialResult<StudyGroup>> {
  ensureSessionWatch();
  const name = typeof input.name === "string" ? input.name.trim() : "";
  if (name.length < 2 || name.length > 80) {
    return { data: null, error: "Give the group a name of 2–80 characters." };
  }
  const topic = cleanOptional(input.topic, 60);
  const pathRef = cleanOptional(input.pathRef, 120);
  const joinCode = makeJoinCode();

  const remote = await acquireRemote().catch(() => null);
  if (!remote) {
    const group = localGroup({ name, topic, pathRef, joinCode });
    upsertCachedGroups([group]);
    return { data: group, error: null };
  }
  if ("error" in remote) {
    const group = localGroup({ name, topic, pathRef, joinCode });
    upsertCachedGroups([group]);
    return { data: group, error: remote.error };
  }

  const { client } = remote;
  const rpc = rpcCall(client);
  if (!rpc) {
    const group = localGroup({ name, topic, pathRef, joinCode });
    upsertCachedGroups([group]);
    return { data: group, error: "Group sync is unavailable." };
  }

  try {
    const { data, error } = await rpc("create_study_group", {
      p_name: name,
      p_topic: topic,
      p_path_ref: pathRef,
      p_join_code: joinCode,
    });
    if (error) throw error;
    const group = mapStudyGroupRow(firstRow(data));
    if (!group) throw new Error("The group was created but could not be read back.");
    upsertCachedGroups([group]);
    return { data: group, error: null };
  } catch (error) {
    // Keep the local-first promise: the group still exists on this device.
    const group = localGroup({ name, topic, pathRef, joinCode });
    upsertCachedGroups([group]);
    return { data: group, error: errorMessage(error) };
  }
}

/**
 * Join by code. Requires a configured, signed-in session — a code cannot be
 * validated locally, so signed out this explains the state instead of
 * pretending it worked.
 */
export async function joinGroup(code: string): Promise<SocialResult<StudyGroup>> {
  ensureSessionWatch();
  const cleaned = normalizeJoinCode(code);
  if (cleaned.length < 4) {
    return { data: null, error: "Enter the group code." };
  }
  const remote = await acquireRemote().catch(() => null);
  if (!remote) {
    return {
      data: null,
      error: "Sign in to join a group — codes live with the account.",
    };
  }
  if ("error" in remote) return { data: null, error: remote.error };
  const rpc = rpcCall(remote.client);
  if (!rpc) return { data: null, error: "Joining is unavailable right now." };
  try {
    const { data, error } = await rpc("join_study_group", { p_code: cleaned });
    if (error) throw error;
    const group = mapStudyGroupRow(firstRow(data));
    if (!group) throw new Error("Joined, but the group details could not be read.");
    upsertCachedGroups([group]);
    return { data: group, error: null };
  } catch (error) {
    return { data: null, error: errorMessage(error) };
  }
}

/**
 * Leave a group. Local-only groups disappear immediately. Remote groups
 * delete the membership row first, so a failed network call never leaves a
 * half-left state that would silently come back on refresh.
 */
export async function leaveGroup(
  groupId: string,
): Promise<SocialResult<{ id: string }>> {
  ensureSessionWatch();
  const group = getGroupSnapshot().groups.find((item) => item.id === groupId);
  if (!group) return { data: null, error: "That group is not in your list." };

  if (group.localOnly) {
    removeCachedGroup(groupId);
    return { data: { id: groupId }, error: null };
  }

  const remote = await acquireRemote().catch(() => null);
  if (!remote) {
    // Signed out: drop the cached copy on this device; the account keeps the
    // membership and it returns when this device signs in again.
    removeCachedGroup(groupId);
    return { data: { id: groupId }, error: null };
  }
  if ("error" in remote) return { data: null, error: remote.error };
  const { client, userId } = remote;
  try {
    const query = client.from("group_members") as unknown as RemoteDeleteQuery;
    const { error } = await query
      .delete()
      .eq("group_id", groupId)
      .eq("user_id", userId);
    if (error) throw error;
    removeCachedGroup(groupId);
    return { data: { id: groupId }, error: null };
  } catch (error) {
    return { data: null, error: errorMessage(error) };
  }
}

/**
 * Refresh the weekly board for one group. The returned board is derived from
 * the cache; remote rows (members, aggregate activity, usernames) are merged
 * first and this device's own aggregate is pushed best-effort.
 */
export async function getGroupLeaderboard(
  groupId: string,
): Promise<SocialResult<GroupLeaderboard>> {
  ensureSessionWatch();
  const fallback = buildGroupBoard(groupId);
  if (!fallback) return { data: null, error: "That group is not in your list." };

  const remote = await acquireRemote().catch(() => null);
  if (!remote) return { data: fallback, error: null };
  if ("error" in remote) return { data: fallback, error: remote.error };
  const { client, userId } = remote;
  const generation = currentGeneration();
  const weekStart = startOfWeekKey();
  try {
    const fetched = await fetchGroupMembers(client, groupId, weekStart, userId);
    if (generation !== currentGeneration()) return { data: buildGroupBoard(groupId), error: null };
    if (fetched.length > 0) setCachedMembers(groupId, fetched);
    void pushSelfActivity(client, groupId, weekStart).catch(() => {});
    return { data: buildGroupBoard(groupId), error: null };
  } catch (error) {
    return { data: fallback, error: errorMessage(error) };
  }
}

/** Recent nudges in one group, merged into the local cache. */
export async function listGroupNudges(
  groupId: string,
): Promise<SocialResult<GroupNudge[]>> {
  ensureSessionWatch();
  const local = () =>
    getGroupSnapshot()
      .nudges.filter((nudge) => nudge.groupId === groupId)
      .sort(
        (a, b) =>
          b.createdAt.localeCompare(a.createdAt) || b.id.localeCompare(a.id),
      );
  const remote = await acquireRemote().catch(() => null);
  if (!remote) return { data: local(), error: null };
  if ("error" in remote) return { data: local(), error: remote.error };
  const { client } = remote;
  const generation = currentGeneration();
  try {
    const { data, error } = await pageQuery(client.from("group_nudges"))
      .select(NUDGE_COLUMNS)
      .eq("group_id", groupId)
      .order("created_at", { ascending: false })
      .range(0, 49);
    if (error) throw error;
    if (generation !== currentGeneration()) return { data: local(), error: null };
    const rows = (Array.isArray(data) ? data : [])
      .map(mapNudgeRow)
      .filter((nudge): nudge is GroupNudge => nudge !== null);
    mergeCachedNudges(rows);
    return { data: local(), error: null };
  } catch (error) {
    return { data: local(), error: errorMessage(error) };
  }
}

/**
 * How long until another nudge to the same person is allowed. Pure so the UI
 * and tests share one clock story.
 */
export function nudgeCooldownRemaining(
  nudges: Pick<GroupNudge, "groupId" | "fromUser" | "toUser" | "createdAt">[],
  groupId: string,
  fromUser: string,
  toUser: string,
  now: number = Date.now(),
): number {
  let latest = 0;
  for (const nudge of nudges) {
    if (
      nudge.groupId !== groupId ||
      nudge.fromUser !== fromUser ||
      nudge.toUser !== toUser
    ) {
      continue;
    }
    const at = Date.parse(nudge.createdAt);
    if (!Number.isNaN(at) && at > latest) latest = at;
  }
  if (latest === 0) return 0;
  return Math.max(0, latest + NUDGE_COOLDOWN_MS - now);
}

/** Human copy for the cooldown chip ("45 min", "2 hours"). */
export function formatNudgeCooldown(ms: number): string {
  const minutes = Math.max(1, Math.ceil(ms / 60000));
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.ceil(minutes / 60);
  return hours === 1 ? "1 hour" : `${hours} hours`;
}

/**
 * Send one nudge row. Local cooldown first (per recipient per group), then
 * the server insert; nothing is cached on failure so offline devices never
 * show a nudge that was not sent. The server adds its own rate cap.
 */
export async function sendNudge(
  groupId: string,
  toUserId: string,
): Promise<SocialResult<GroupNudge>> {
  ensureSessionWatch();
  const me = getGroupSelfId();
  if (toUserId === me) {
    return { data: null, error: "You can't nudge yourself — just solve one." };
  }
  const waitMs = nudgeCooldownRemaining(
    getGroupSnapshot().nudges,
    groupId,
    me,
    toUserId,
  );
  if (waitMs > 0) {
    return {
      data: null,
      error: `You already nudged them recently — try again in ${formatNudgeCooldown(waitMs)}.`,
    };
  }

  const remote = await acquireRemote().catch(() => null);
  if (!remote) {
    // No account: a nudge log without recipients is still useful locally
    // (cooldown + history), so record it under the local identity.
    const nudge: GroupNudge = {
      id: makeId("gn"),
      groupId,
      fromUser: me,
      toUser: toUserId,
      createdAt: new Date().toISOString(),
      seen: false,
    };
    mergeCachedNudges([nudge]);
    return { data: nudge, error: null };
  }
  if ("error" in remote) return { data: null, error: remote.error };

  const { client, userId } = remote;
  const nudge: GroupNudge = {
    id: makeId("gn"),
    groupId,
    fromUser: userId,
    toUser: toUserId,
    createdAt: new Date().toISOString(),
    seen: false,
  };
  try {
    const { error } = await client.from("group_nudges").insert({
      id: nudge.id,
      group_id: nudge.groupId,
      from_user: nudge.fromUser,
      to_user: nudge.toUser,
      created_at: nudge.createdAt,
      seen: false,
    });
    if (error) throw error;
    mergeCachedNudges([nudge]);
    return { data: nudge, error: null };
  } catch (error) {
    return { data: null, error: errorMessage(error) };
  }
}

/** Acknowledge a nudge addressed to the current user. */
export async function markNudgeSeen(
  nudgeId: string,
): Promise<SocialResult<{ id: string }>> {
  ensureSessionWatch();
  const nudge = getGroupSnapshot().nudges.find((item) => item.id === nudgeId);
  if (nudge?.seen) return { data: { id: nudgeId }, error: null };

  const remote = await acquireRemote().catch(() => null);
  if (!remote) {
    setCachedNudgeSeen(nudgeId);
    return { data: { id: nudgeId }, error: null };
  }
  if ("error" in remote) return { data: null, error: remote.error };
  const { client, userId } = remote;
  try {
    const { error } = await client
      .from("group_nudges")
      .update({ seen: true })
      .eq("id", nudgeId)
      .eq("to_user", userId);
    if (error) throw error;
    setCachedNudgeSeen(nudgeId);
    return { data: { id: nudgeId }, error: null };
  } catch (error) {
    return { data: null, error: errorMessage(error) };
  }
}

/**
 * Merge one realtime `group_activity` row into the cached member list. Only
 * the current week is adopted; a stale week's numbers must not overwrite the
 * live board.
 */
function mergeRealtimeActivity(groupId: string, row: unknown): void {
  if (!row || typeof row !== "object") return;
  const value = row as Row;
  const userId = stringValue(value.user_id);
  if (!userId) return;
  if (stringValue(value.week_start) !== startOfWeekKey()) return;
  const current = getGroupSnapshot().members[groupId];
  if (!current) return;
  const next = current.map((member) =>
    member.userId === userId
      ? {
          ...member,
          weeklySolved: numberValue(value.solved_count),
          streak: numberValue(value.streak),
          lastActiveAt: stringValue(value.last_active_at),
        }
      : member,
  );
  setCachedMembers(groupId, next);
}
