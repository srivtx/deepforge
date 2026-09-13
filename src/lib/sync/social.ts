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

let requestGeneration = 0;
let sessionWatchInstalled = false;

function notify(): void {
  for (const listener of [...listeners]) {
    try {
      listener();
    } catch {}
  }
}

function nextGeneration(): number {
  requestGeneration += 1;
  return requestGeneration;
}

function ensureSessionWatch(): void {
  if (sessionWatchInstalled) return;
  sessionWatchInstalled = true;
  onSessionChange(() => {
    requestGeneration += 1;
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

export async function listThreads(): Promise<SocialResult<ForumThread[]>> {
  ensureSessionWatch();
  const local = () => getForumSnapshot().threads;
  const remote = await acquireRemote().catch(() => null);
  if (!remote) return { data: local(), error: null };
  if ("error" in remote) return { data: local(), error: remote.error };
  const { client, userId } = remote;
  const generation = nextGeneration();
  try {
    const { data, error } = await client.from("forum_threads").select("*");
    if (error) throw error;
    if (generation !== requestGeneration) return { data: local(), error: null };
    const remoteThreads = (Array.isArray(data) ? data : [])
      .map(mapThreadRow)
      .filter((thread): thread is ForumThread => thread !== null);
    const remoteIds = new Set(remoteThreads.map((thread) => thread.id));
    const remoteKeys = new Set(remoteThreads.map(threadIdentity));
    const pending = local().filter(
      (thread) =>
        !remoteIds.has(thread.id) && !remoteKeys.has(threadIdentity(thread)),
    );
    let pushError: string | null = null;
    for (const thread of pending) {
      const failure = await pushLocalThread(client, userId, thread);
      if (failure && !pushError) pushError = failure;
    }
    if (generation !== requestGeneration) return { data: local(), error: null };
    mergeRemoteThreads(remoteThreads);
    const upvotes = await fetchOwnUpvoteIds(client, userId);
    if (generation !== requestGeneration) return { data: local(), error: null };
    mergeRemoteUpvoteIds(upvotes.threadIds, upvotes.replyIds);
    return { data: local(), error: pushError };
  } catch (error) {
    return { data: local(), error: errorMessage(error) };
  }
}

export async function listReplies(
  threadId: string,
): Promise<SocialResult<ForumReply[]>> {
  ensureSessionWatch();
  const local = () => getReplies(threadId);
  const remote = await acquireRemote().catch(() => null);
  if (!remote) return { data: local(), error: null };
  if ("error" in remote) return { data: local(), error: remote.error };
  const { client, userId } = remote;
  const generation = nextGeneration();
  try {
    const { data, error } = await client
      .from("forum_replies")
      .select("*")
      .eq("thread_id", threadId);
    if (error) throw error;
    if (generation !== requestGeneration) return { data: local(), error: null };
    const remoteReplies = (Array.isArray(data) ? data : [])
      .map(mapReplyRow)
      .filter((reply): reply is ForumReply => reply !== null);
    const remoteIds = new Set(remoteReplies.map((reply) => reply.id));
    const remoteKeys = new Set(remoteReplies.map(replyIdentity));
    const pending = local().filter(
      (reply) =>
        !remoteIds.has(reply.id) && !remoteKeys.has(replyIdentity(reply)),
    );
    let pushError: string | null = null;
    for (const reply of pending) {
      const failure = await pushLocalReply(client, userId, reply);
      if (failure && !pushError) pushError = failure;
    }
    if (generation !== requestGeneration) return { data: local(), error: null };
    mergeRemoteReplies(remoteReplies);
    return { data: local(), error: pushError };
  } catch (error) {
    return { data: local(), error: errorMessage(error) };
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
    toggleLocal(id);
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
): Promise<SocialResult<Comment[]>> {
  ensureSessionWatch();
  const local = () => getComments(problemId);
  const remote = await acquireRemote().catch(() => null);
  if (!remote) return { data: local(), error: null };
  if ("error" in remote) return { data: local(), error: remote.error };
  const { client, userId } = remote;
  const generation = nextGeneration();
  try {
    const [rows, upvoteRows] = await Promise.all([
      client.from("comments").select("*").eq("problem_id", problemId),
      client.from("comment_upvotes").select("comment_id").eq("user_id", userId),
    ]);
    if (rows.error) throw rows.error;
    if (generation !== requestGeneration) return { data: local(), error: null };
    const upvoted = new Set(upvoteRows.error ? [] : idsFromRows(upvoteRows.data, "comment_id"));
    const remoteComments = (Array.isArray(rows.data) ? rows.data : [])
      .map((row) => mapCommentRow(row, false))
      .filter((comment): comment is Comment => comment !== null)
      .map((comment) => ({ ...comment, upvotedByMe: upvoted.has(comment.id) }));
    const remoteIds = new Set(remoteComments.map((comment) => comment.id));
    const remoteKeys = new Set(remoteComments.map(commentIdentity));
    const pending = local().filter(
      (comment) =>
        !remoteIds.has(comment.id) &&
        !remoteKeys.has(commentIdentity(comment)),
    );
    let pushError: string | null = null;
    for (const comment of pending) {
      const failure = await pushLocalComment(client, userId, comment);
      if (failure && !pushError) pushError = failure;
    }
    if (generation !== requestGeneration) return { data: local(), error: null };
    mergeRemoteComments(problemId, remoteComments);
    return { data: local(), error: pushError };
  } catch (error) {
    return { data: local(), error: errorMessage(error) };
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
