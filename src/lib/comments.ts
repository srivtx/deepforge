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

export function addComment(problemId: string, body: string): Comment | null {
  const text = body.trim();
  if (!text) return null;
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
  return comment;
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

export type ForumCategory =
  | "Interview Experiences"
  | "ML Questions"
  | "Contest Debriefs"
  | "General";

export const FORUM_CATEGORIES: ForumCategory[] = [
  "Interview Experiences",
  "ML Questions",
  "Contest Debriefs",
  "General",
];

export interface ForumThread {
  id: string;
  title: string;
  body: string;
  category: ForumCategory;
  author: string;
  createdAt: string;
  upvotes: number;
  problemRefs: string[];
}

export interface ForumReply {
  id: string;
  threadId: string;
  author: string;
  body: string;
  createdAt: string;
  upvotes: number;
}

export interface ForumThreadInput {
  title: string;
  body: string;
  category: ForumCategory;
  problemRefs?: string[];
}

export interface ForumReplyInput {
  body: string;
}

export interface ForumSnapshot {
  threads: ForumThread[];
  replies: ForumReply[];
  upvotedThreadIds: string[];
  upvotedReplyIds: string[];
}

const FORUM_STORAGE_KEY = "deepforge:forum";
export const FORUM_CHANGE_EVENT = "deepforge:forum-change";

const FORUM_USERNAME_KEY = "deepforge:username:v1";

interface ForumStore {
  threads: ForumThread[];
  replies: ForumReply[];
  upvotedThreads: string[];
  upvotedReplies: string[];
}

function emptyForum(): ForumStore {
  return { threads: [], replies: [], upvotedThreads: [], upvotedReplies: [] };
}

export function isForumCategory(value: unknown): value is ForumCategory {
  return (
    typeof value === "string" &&
    (FORUM_CATEGORIES as string[]).includes(value)
  );
}

function isForumThread(value: unknown): value is ForumThread {
  if (typeof value !== "object" || value === null) return false;
  const t = value as Record<string, unknown>;
  return (
    typeof t.id === "string" &&
    typeof t.title === "string" &&
    typeof t.body === "string" &&
    isForumCategory(t.category) &&
    typeof t.author === "string" &&
    typeof t.createdAt === "string" &&
    typeof t.upvotes === "number" &&
    Array.isArray(t.problemRefs) &&
    t.problemRefs.every((ref) => typeof ref === "string")
  );
}

function isForumReply(value: unknown): value is ForumReply {
  if (typeof value !== "object" || value === null) return false;
  const r = value as Record<string, unknown>;
  return (
    typeof r.id === "string" &&
    typeof r.threadId === "string" &&
    typeof r.author === "string" &&
    typeof r.body === "string" &&
    typeof r.createdAt === "string" &&
    typeof r.upvotes === "number"
  );
}

function stringList(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string");
}

function readForum(): ForumStore {
  if (typeof window === "undefined") return emptyForum();
  try {
    const raw = window.localStorage.getItem(FORUM_STORAGE_KEY);
    if (!raw) return emptyForum();
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed === null) return emptyForum();
    const p = parsed as Record<string, unknown>;
    return {
      threads: Array.isArray(p.threads) ? p.threads.filter(isForumThread) : [],
      replies: Array.isArray(p.replies) ? p.replies.filter(isForumReply) : [],
      upvotedThreads: stringList(p.upvotedThreads),
      upvotedReplies: stringList(p.upvotedReplies),
    };
  } catch {
    return emptyForum();
  }
}

function writeForum(store: ForumStore): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(FORUM_STORAGE_KEY, JSON.stringify(store));
    window.dispatchEvent(new CustomEvent(FORUM_CHANGE_EVENT));
  } catch {
    /* storage unavailable — silently ignore */
  }
}

function makeForumId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function forumAuthor(): string {
  if (typeof window === "undefined") return "You";
  try {
    const stored = window.localStorage.getItem(FORUM_USERNAME_KEY);
    return stored && stored.trim() ? stored.trim() : "You";
  } catch {
    return "You";
  }
}

function normalizeRefs(refs: string[] | undefined): string[] {
  if (!refs) return [];
  const out: string[] = [];
  for (const raw of refs) {
    if (typeof raw !== "string") continue;
    const id = raw.trim().replace(/^#+/, "").toLowerCase();
    if (!id || out.includes(id)) continue;
    out.push(id);
  }
  return out;
}

export function getThreads(): ForumThread[] {
  return [...readForum().threads].sort((a, b) =>
    b.createdAt.localeCompare(a.createdAt),
  );
}

export function createThread(input: ForumThreadInput): ForumThread {
  const store = readForum();
  const thread: ForumThread = {
    id: makeForumId("ft"),
    title: input.title.trim(),
    body: input.body.trim(),
    category: input.category,
    author: forumAuthor(),
    createdAt: new Date().toISOString(),
    upvotes: 0,
    problemRefs: normalizeRefs(input.problemRefs),
  };
  store.threads = [...store.threads, thread];
  writeForum(store);
  return thread;
}

export function getReplies(threadId: string): ForumReply[] {
  return readForum()
    .replies.filter((reply) => reply.threadId === threadId)
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

export function addReply(threadId: string, input: ForumReplyInput): ForumReply {
  const store = readForum();
  const reply: ForumReply = {
    id: makeForumId("fr"),
    threadId,
    author: forumAuthor(),
    body: input.body.trim(),
    createdAt: new Date().toISOString(),
    upvotes: 0,
  };
  store.replies = [...store.replies, reply];
  writeForum(store);
  return reply;
}

export function upvoteThread(id: string): void {
  const store = readForum();
  const already = store.upvotedThreads.includes(id);
  let found = false;
  store.threads = store.threads.map((thread) => {
    if (thread.id !== id) return thread;
    found = true;
    return {
      ...thread,
      upvotes: Math.max(0, thread.upvotes + (already ? -1 : 1)),
    };
  });
  if (!found) return;
  store.upvotedThreads = already
    ? store.upvotedThreads.filter((threadId) => threadId !== id)
    : [...store.upvotedThreads, id];
  writeForum(store);
}

export function upvoteReply(id: string): void {
  const store = readForum();
  const already = store.upvotedReplies.includes(id);
  let found = false;
  store.replies = store.replies.map((reply) => {
    if (reply.id !== id) return reply;
    found = true;
    return {
      ...reply,
      upvotes: Math.max(0, reply.upvotes + (already ? -1 : 1)),
    };
  });
  if (!found) return;
  store.upvotedReplies = already
    ? store.upvotedReplies.filter((replyId) => replyId !== id)
    : [...store.upvotedReplies, id];
  writeForum(store);
}

export function deleteThread(id: string): void {
  const store = readForum();
  if (!store.threads.some((thread) => thread.id === id)) return;
  const removedReplyIds = new Set(
    store.replies.filter((reply) => reply.threadId === id).map((r) => r.id),
  );
  store.threads = store.threads.filter((thread) => thread.id !== id);
  store.replies = store.replies.filter((reply) => reply.threadId !== id);
  store.upvotedThreads = store.upvotedThreads.filter(
    (threadId) => threadId !== id,
  );
  store.upvotedReplies = store.upvotedReplies.filter(
    (replyId) => !removedReplyIds.has(replyId),
  );
  writeForum(store);
}

export function getForumSnapshot(): ForumSnapshot {
  const store = readForum();
  return {
    threads: [...store.threads].sort((a, b) =>
      b.createdAt.localeCompare(a.createdAt),
    ),
    replies: [...store.replies].sort((a, b) =>
      a.createdAt.localeCompare(b.createdAt),
    ),
    upvotedThreadIds: [...store.upvotedThreads],
    upvotedReplyIds: [...store.upvotedReplies],
  };
}

export function seedForum(): void {
  if (readForum().threads.length > 0) return;
  const now = Date.now();
  const ago = (minutes: number) =>
    new Date(now - minutes * 60_000).toISOString();

  const threads: ForumThread[] = [
    {
      id: "ft-seed-1",
      title:
        "Meta ML screen: write softmax from scratch, then explain numerical stability",
      body: "Sharing my loop while it is fresh. 45 minutes, no autocomplete:\n\n1. Implement `softmax(x)` for a 1-D NumPy array.\n2. Prove the max-subtraction trick does not change the result.\n3. What happens if every logit is `-inf`?\n\nI nailed 1 and 2 but blanked on 3. Practice #dl-003 until the -inf case is automatic, and be ready to say why `log(sum(exp(x)))` is the stable form of log-softmax. They also asked for cross-entropy backprop by hand right after.",
      category: "Interview Experiences",
      author: "backprop_bella",
      createdAt: ago(2880),
      upvotes: 27,
      problemRefs: ["dl-003"],
    },
    {
      id: "ft-seed-2",
      title: "Why does K-Means sometimes produce empty clusters?",
      body: "I am implementing K-Means one iteration at a time (#ml-003) and every so often a centroid ends up with zero assigned points. My naive fix is to reinitialize that centroid at a random point, but a reviewer said that breaks convergence guarantees. What do you all do in practice? Does this ever come up in interviews?",
      category: "ML Questions",
      author: "kernel_kat",
      createdAt: ago(1560),
      upvotes: 14,
      problemRefs: ["ml-003"],
    },
    {
      id: "ft-seed-3",
      title: "Warm-up Sprint debrief: 6/6 in 07:42, here is the route",
      body: "First clean sweep of the Warm-up Sprint contest.\n\nOrder I attacked: #la-002 (2 min) -> #st-001 (1 min) -> #pr-002 (2 min) -> #info-001 (1 min) -> #nlp-001 (1 min) -> #cv-001 (1 min).\n\nThe trick is to bank the one-liners first and leave the matrix problems for the end so the clock pressure does not hit you mid-derivation. What order do you all use?",
      category: "Contest Debriefs",
      author: "sigmoid_sam",
      createdAt: ago(300),
      upvotes: 11,
      problemRefs: [
        "la-002",
        "st-001",
        "pr-002",
        "nlp-001",
        "info-001",
        "cv-001",
      ],
    },
    {
      id: "ft-seed-4",
      title: "Amazon DS loop: the precision/recall round went three levels deep",
      body: "The whole round was one confusion matrix. First precision, recall, and F1 from the counts. Then: which metric do you optimize for a fraud detector, and why? Then: how does the threshold move the tradeoff? I had practiced #ml-009 so the formulas were free and I could spend the time on the discussion. Bring a concrete example where accuracy lies.",
      category: "Interview Experiences",
      author: "matrix_mo",
      createdAt: ago(4320),
      upvotes: 33,
      problemRefs: ["ml-009"],
    },
    {
      id: "ft-seed-5",
      title: "Backprop through an MLP by hand — where do you start?",
      body: "Every time I derive backprop from scratch I get lost in the index notation. I can do the single-neuron case (#ml-002) cleanly but #dl-005 with a hidden layer turns into a wall of partials. Do you all start from the loss and work backwards, or write the forward pass as a computation graph first? Looking for a repeatable process, not just the answer.",
      category: "ML Questions",
      author: "grad_descender",
      createdAt: ago(480),
      upvotes: 8,
      problemRefs: ["dl-005", "ml-002"],
    },
    {
      id: "ft-seed-6",
      title: "How are you using DeepForge in your study routine?",
      body: "Curious how folks sequence this. I have been doing 30 minutes of problems in the morning, then a contest on Saturdays to force speed, then reviewing whatever I missed on Sunday. The streak counter is doing a lot of motivational heavy lifting. What works for you?",
      category: "General",
      author: "tensor_tina",
      createdAt: ago(30),
      upvotes: 6,
      problemRefs: [],
    },
  ];

  const replies: ForumReply[] = [
    {
      id: "fr-seed-1",
      threadId: "ft-seed-1",
      author: "grad_descender",
      body: "The -inf trap is real. What helped me: if all logits are -inf the distribution is undefined, so interviews usually want you to detect it and return a uniform distribution or raise. Saying that out loud got me the offer.",
      createdAt: ago(2700),
      upvotes: 9,
    },
    {
      id: "fr-seed-2",
      threadId: "ft-seed-1",
      author: "tensor_tina",
      body: "Same loop at a different company last month. I warmed up on #dl-003 and #dl-005 the night before and it paid off — the follow-up was exactly the backward pass.",
      createdAt: ago(2400),
      upvotes: 5,
    },
    {
      id: "fr-seed-3",
      threadId: "ft-seed-2",
      author: "dropout_dan",
      body: "Two standard fixes: re-seed the empty centroid to the point farthest from its cluster (k-means++ style), or re-seed to a random point. Both break strict convergence, so most implementations just cap the number of restarts. Interviewers usually want you to notice the empty-cluster case and discuss the tradeoff.",
      createdAt: ago(1500),
      upvotes: 6,
    },
    {
      id: "fr-seed-4",
      threadId: "ft-seed-2",
      author: "epoch_emma",
      body: "Worth mentioning that empty clusters are a symptom of a bad init. If you initialize with actual data points (k-means++), you rarely see them.",
      createdAt: ago(1400),
      upvotes: 3,
    },
    {
      id: "fr-seed-5",
      threadId: "ft-seed-3",
      author: "batch_norm_ben",
      body: "Nice run. I always start with #pr-002 because counting problems are where I lose the most time if I am cold. Saving #la-002 for last is smart — that one punishes sloppy index math.",
      createdAt: ago(240),
      upvotes: 4,
    },
    {
      id: "fr-seed-6",
      threadId: "ft-seed-4",
      author: "relu_raj",
      body: "The threshold question is where people fall apart. If you can sketch precision and recall as functions of the threshold and name the cost asymmetry, you are done. Also expect a follow-up on PR vs ROC AUC for imbalanced data.",
      createdAt: ago(4200),
      upvotes: 8,
    },
    {
      id: "fr-seed-7",
      threadId: "ft-seed-4",
      author: "softmax_sara",
      body: "Exact same questions at a fintech loop. I froze on macro vs micro F1 — do not be me, know both.",
      createdAt: ago(4000),
      upvotes: 2,
    },
    {
      id: "fr-seed-8",
      threadId: "ft-seed-5",
      author: "vanishing_vic",
      body: "Computation graph. Write every intermediate, then walk backwards applying the chain rule one node at a time. For a two-layer MLP there are only five nodes, and the wall of partials disappears. Then check your Jacobian against a finite-difference approximation — that is how I finally trusted my derivation.",
      createdAt: ago(420),
      upvotes: 5,
    },
    {
      id: "fr-seed-9",
      threadId: "ft-seed-6",
      author: "dropout_dan",
      body: "Problems on weekdays, one contest Sunday. I keep a running list of every problem I missed and re-solve it from a blank editor two weeks later. Spaced repetition, but for code.",
      createdAt: ago(15),
      upvotes: 1,
    },
  ];

  writeForum({
    threads,
    replies,
    upvotedThreads: [],
    upvotedReplies: [],
  });
}

function sameThread(a: ForumThread, b: ForumThread): boolean {
  return (
    a.id === b.id &&
    a.title === b.title &&
    a.body === b.body &&
    a.category === b.category &&
    a.author === b.author &&
    a.createdAt === b.createdAt &&
    a.upvotes === b.upvotes &&
    a.problemRefs.length === b.problemRefs.length &&
    a.problemRefs.every((ref, index) => ref === b.problemRefs[index])
  );
}

function sameReply(a: ForumReply, b: ForumReply): boolean {
  return (
    a.id === b.id &&
    a.threadId === b.threadId &&
    a.author === b.author &&
    a.body === b.body &&
    a.createdAt === b.createdAt &&
    a.upvotes === b.upvotes
  );
}

function sameComment(a: Comment, b: Comment): boolean {
  return (
    a.id === b.id &&
    a.problemId === b.problemId &&
    a.author === b.author &&
    a.body === b.body &&
    a.createdAt === b.createdAt &&
    a.upvotes === b.upvotes &&
    a.upvotedByMe === b.upvotedByMe
  );
}

function threadIdentity(thread: ForumThread): string {
  return `${thread.title}\u0000${thread.createdAt}`;
}

function replyIdentity(reply: ForumReply): string {
  return `${reply.threadId}\u0000${reply.body}\u0000${reply.createdAt}`;
}

function commentIdentity(comment: Comment): string {
  return `${comment.problemId}\u0000${comment.author}\u0000${comment.body}\u0000${comment.createdAt}`;
}

function byCreatedAt(
  a: { createdAt: string; id: string },
  b: { createdAt: string; id: string },
): number {
  return a.createdAt.localeCompare(b.createdAt) || a.id.localeCompare(b.id);
}

export function mergeRemoteThreads(remote: ForumThread[]): void {
  if (remote.length === 0) return;
  const store = readForum();
  const remoteIds = new Set(remote.map((thread) => thread.id));
  const remoteKeys = new Set(remote.map(threadIdentity));
  const pending = store.threads.filter(
    (thread) => !remoteIds.has(thread.id) && !remoteKeys.has(threadIdentity(thread)),
  );
  const merged = [...pending, ...remote].sort(byCreatedAt);
  if (
    merged.length === store.threads.length &&
    merged.every((thread, index) => sameThread(thread, store.threads[index]))
  ) {
    return;
  }
  store.threads = merged;
  writeForum(store);
}

export function mergeRemoteReplies(remote: ForumReply[]): void {
  if (remote.length === 0) return;
  const store = readForum();
  const remoteIds = new Set(remote.map((reply) => reply.id));
  const remoteKeys = new Set(remote.map(replyIdentity));
  const pending = store.replies.filter(
    (reply) => !remoteIds.has(reply.id) && !remoteKeys.has(replyIdentity(reply)),
  );
  const merged = [...pending, ...remote].sort(byCreatedAt);
  if (
    merged.length === store.replies.length &&
    merged.every((reply, index) => sameReply(reply, store.replies[index]))
  ) {
    return;
  }
  store.replies = merged;
  writeForum(store);
}

export function mergeRemoteUpvoteIds(
  threadIds: string[],
  replyIds: string[],
): void {
  const store = readForum();
  const threads = new Set(store.upvotedThreads);
  const replies = new Set(store.upvotedReplies);
  let changed = false;
  for (const id of threadIds) {
    if (!threads.has(id)) {
      threads.add(id);
      changed = true;
    }
  }
  for (const id of replyIds) {
    if (!replies.has(id)) {
      replies.add(id);
      changed = true;
    }
  }
  if (!changed) return;
  store.upvotedThreads = [...threads];
  store.upvotedReplies = [...replies];
  writeForum(store);
}

export function setThreadUpvoteCount(id: string, count: number): void {
  const store = readForum();
  const next = Math.max(0, Math.floor(count));
  let changed = false;
  store.threads = store.threads.map((thread) => {
    if (thread.id !== id || thread.upvotes === next) return thread;
    changed = true;
    return { ...thread, upvotes: next };
  });
  if (changed) writeForum(store);
}

export function setReplyUpvoteCount(id: string, count: number): void {
  const store = readForum();
  const next = Math.max(0, Math.floor(count));
  let changed = false;
  store.replies = store.replies.map((reply) => {
    if (reply.id !== id || reply.upvotes === next) return reply;
    changed = true;
    return { ...reply, upvotes: next };
  });
  if (changed) writeForum(store);
}

export function mergeRemoteComments(
  problemId: string,
  remote: Comment[],
): void {
  if (remote.length === 0) return;
  const store = read();
  const list = store[problemId] ?? [];
  const remoteIds = new Set(remote.map((comment) => comment.id));
  const remoteKeys = new Set(remote.map(commentIdentity));
  const pending = list.filter(
    (comment) =>
      !remoteIds.has(comment.id) && !remoteKeys.has(commentIdentity(comment)),
  );
  const existing = new Map(list.map((comment) => [comment.id, comment]));
  const fromRemote = remote.map((comment) => {
    const previous = existing.get(comment.id);
    if (!previous) return comment;
    return {
      ...comment,
      upvotedByMe: previous.upvotedByMe || comment.upvotedByMe,
    };
  });
  const merged = [...pending, ...fromRemote].sort(byCreatedAt);
  if (
    merged.length === list.length &&
    merged.every((comment, index) => sameComment(comment, list[index]))
  ) {
    return;
  }
  if (merged.length === 0) {
    delete store[problemId];
  } else {
    store[problemId] = merged;
  }
  write(store);
}

export function formatRelativeTime(iso: string): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "";
  const seconds = Math.floor((Date.now() - then) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  const weeks = Math.floor(days / 7);
  if (weeks < 5) return `${weeks}w ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  return `${Math.floor(days / 365)}y ago`;
}
