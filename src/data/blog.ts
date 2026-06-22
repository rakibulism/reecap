import postsData from './blog-posts.json';
import postsData2 from './blog-posts-2.json';

export interface FAQItem { q: string; a: string; }
export interface BlogBlock { type: 'p' | 'h2' | 'ul'; text?: string; items?: string[]; }

export interface BlogPost {
  slug: string;
  title: string;
  date: string;        // ISO (published)
  updated: string;     // ISO (last updated)
  author: string;
  readingTime: string;
  category: string;
  excerpt: string;
  description: string; // meta description
  keywords: string[];
  cover: string;       // tailwind gradient classes
  body: BlogBlock[];
  faq: FAQItem[];
}

// Posts live in batched files (blog-posts.json, blog-posts-2.json, …) so large
// additions stay reviewable. Merge and present newest-first.
export const BLOG_POSTS = ([...(postsData2 as BlogPost[]), ...(postsData as BlogPost[])])
  .sort((a, b) => (b.date.localeCompare(a.date) || a.slug.localeCompare(b.slug)));

export const getPost = (slug: string) => BLOG_POSTS.find((p) => p.slug === slug);

export const CATEGORIES = Array.from(new Set(BLOG_POSTS.map((p) => p.category)));
