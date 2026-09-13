import type { BlogEntry } from "./types";
import {
  post as verifyingProblems,
  Content as VerifyingProblemsContent,
} from "./verifying-5050-problems-with-real-python";
import {
  post as offlineFirstSync,
  Content as OfflineFirstSyncContent,
} from "./offline-first-sync-with-supabase";
import {
  post as routesMigration,
  Content as RoutesMigrationContent,
} from "./from-one-long-page-to-24-routes";
import {
  post as avatarEngine,
  Content as AvatarEngineContent,
} from "./building-a-150-trait-avatar-engine";

const ENTRIES: BlogEntry[] = [
  { post: avatarEngine, Content: AvatarEngineContent },
  { post: verifyingProblems, Content: VerifyingProblemsContent },
  { post: offlineFirstSync, Content: OfflineFirstSyncContent },
  { post: routesMigration, Content: RoutesMigrationContent },
];

export const POSTS: BlogEntry[] = [...ENTRIES].sort(
  (a, b) => Date.parse(b.post.date) - Date.parse(a.post.date),
);

export function getPostBySlug(slug: string): BlogEntry | undefined {
  return POSTS.find((entry) => entry.post.slug === slug);
}

export interface AdjacentPosts {
  previous: BlogEntry | null;
  next: BlogEntry | null;
}

export function getAdjacentPosts(slug: string): AdjacentPosts {
  const index = POSTS.findIndex((entry) => entry.post.slug === slug);
  if (index === -1) return { previous: null, next: null };
  return {
    previous: POSTS[index + 1] ?? null,
    next: POSTS[index - 1] ?? null,
  };
}

export type { BlogPost, BlogEntry } from "./types";
