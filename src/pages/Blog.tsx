import React from 'react';
import { Link } from 'react-router-dom';
import SiteLayout from '../components/site/SiteLayout';
import { BLOG_POSTS } from '../data/blog';

const fmtDate = (iso: string) =>
  new Date(iso + 'T00:00:00').toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });

const Blog: React.FC = () => (
  <SiteLayout>
    <div className="max-w-5xl mx-auto px-5 sm:px-6 py-14 sm:py-20">
      <header className="mb-12">
        <p className="text-[13px] font-semibold uppercase tracking-[0.1em] text-[var(--color-primary)] mb-3">Blog</p>
        <h1 className="text-3xl sm:text-5xl font-bold tracking-tight mb-4">Notes from the Reecap team</h1>
        <p className="text-base sm:text-lg text-[var(--color-text-secondary)] leading-relaxed">Product updates, how it works, and tips for better recaps.</p>
      </header>

      <div className="grid sm:grid-cols-2 gap-6">
        {BLOG_POSTS.map((post, i) => (
          <Link
            key={post.slug}
            to={`/blog/${post.slug}`}
            className={`group rounded-2xl border border-[var(--color-border-default)] bg-[var(--color-bg-surface)] overflow-hidden hover:border-[var(--color-primary)]/40 transition-colors ${i === 0 ? 'sm:col-span-2' : ''}`}
          >
            <div className={`bg-gradient-to-br ${post.cover} ${i === 0 ? 'h-44 sm:h-56' : 'h-40'}`} />
            <div className="p-5 sm:p-6">
              <div className="flex items-center gap-3 text-[12px] text-[var(--color-text-muted)] mb-2 tabular-nums">
                <span>{fmtDate(post.date)}</span><span>·</span><span>{post.readingTime}</span>
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

export default Blog;
