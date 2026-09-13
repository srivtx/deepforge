import type { ReactNode } from "react";

export interface BlogPost {
  slug: string;
  title: string;
  abstract: string;
  date: string;
  readingMinutes: number;
  tags: string[];
  authors?: string[];
  hero?: ReactNode;
}

export interface BlogEntry {
  post: BlogPost;
  Content: () => ReactNode;
}
