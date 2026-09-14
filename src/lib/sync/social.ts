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
import { getCachedSession, onSessionChange } from "@/lib/sync/backend";
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
  | { kind: "comments"; problemId: string };

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
  return "comments";
}

function realtimeFilter(topic: SocialRealtimeTopic): string | undefined {
  if (topic.kind === "replies") return `thread_id=eq.${topic.threadId}`;
  if (topic.kind === "comments") return `problem_id=eq.${topic.problemId}`;
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
  const comment = mapCommentRow(row, false);
  if (comment && comment.problemId === topic.problemId) {
    mergeRemoteComments(topic.problemId, [comment]);
  }
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
        .on("postgres_changes", { event: "UPDATE", ...scope }, receive)
        .subscribe();
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

