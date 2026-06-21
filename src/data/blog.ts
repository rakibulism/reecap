import postsData from './blog-posts.json';

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

export const BLOG_POSTS = postsData as BlogPost[];

export const getPost = (slug: string) => BLOG_POSTS.find((p) => p.slug === slug);

export const CATEGORIES = Array.from(new Set(BLOG_POSTS.map((p) => p.category)));
