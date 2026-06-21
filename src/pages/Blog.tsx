import React from 'react';
import { Link } from 'react-router-dom';
import SiteLayout from '../components/site/SiteLayout';
import { BLOG_POSTS } from '../data/blog';
import { useSeo, SITE_URL } from '../lib/seo';

const fmtDate = (iso: string) =>
  new Date(iso + 'T00:00:00').toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });

const Blog: React.FC = () => {
  useSeo({
    title: 'Blog — Photo & Video Recap Tips | Reecap',
    description: 'Guides and tutorials on turning photos into videos — slideshows, Reels, transitions, captions, and exporting MP4s, all in your browser.',
    path: '/blog',
    keywords: ['photo to video blog', 'recap video tips', 'slideshow tutorials'],
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'Blog',
      name: 'Reecap Blog',
      url: `${SITE_URL}/blog`,
      blogPost: BLOG_POSTS.map((p) => ({
        '@type': 'BlogPosting',
        headline: p.title,
        url: `${SITE_URL}/blog/${p.slug}`,
        datePublished: p.date,
        author: { '@type': 'Person', name: p.author },
      })),
    },
  });

  return (
    <SiteLayout>
      <div className="max-w-5xl mx-auto px-5 sm:px-6 py-14 sm:py-20">
        <header className="mb-12">
          <p className="text-[13px] font-semibold uppercase tracking-[0.1em] text-[var(--color-primary)] mb-3">Blog</p>
          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight mb-4">Turn photos into video — guides & tips</h1>
          <p className="text-base sm:text-lg text-[var(--color-text-secondary)] leading-relaxed">
            How-tos, comparisons, and ideas for making recap videos, slideshows, Reels, and Shorts from your photos.
          </p>
        </header>

        <div className="grid sm:grid-cols-2 gap-6">
          {BLOG_POSTS.map((post, i) => (
            <Link
              key={post.slug}
              to={`/blog/${post.slug}`}
              className={`group rounded-2xl border border-[var(--color-border-default)] bg-[var(--color-bg-surface)] overflow-hidden hover:border-[var(--color-primary)]/40 transition-colors ${i === 0 ? 'sm:col-span-2' : ''}`}
            >
              <div className={`bg-gradient-to-br ${post.cover} ${i === 0 ? 'h-44 sm:h-56' : 'h-36'}`} />
              <div className="p-5 sm:p-6">
                <div className="flex items-center gap-2.5 text-[12px] mb-2">
                  <span className="font-bold uppercase tracking-wide text-[var(--color-primary)] text-[11px]">{post.category}</span>
                  <span className="text-[var(--color-text-muted)]">·</span>
                  <span className="text-[var(--color-text-muted)] tabular-nums">{fmtDate(post.date)}</span>
                  <span className="text-[var(--color-text-muted)]">·</span>
                  <span className="text-[var(--color-text-muted)]">{post.readingTime}</span>
                </div>
                <h2 className={`font-bold tracking-tight mb-2 group-hover:text-[var(--color-primary)] transition-colors ${i === 0 ? 'text-xl sm:text-2xl' : 'text-lg'}`}>{post.title}</h2>
                <p className="text-[var(--color-text-secondary)] leading-relaxed text-[15px]">{post.excerpt}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </SiteLayout>
  );
};

export default Blog;
