import React from 'react';
import { Link, useParams, Navigate } from 'react-router-dom';
import { ArrowLeft } from 'phosphor-react';
import SiteLayout from '../components/site/SiteLayout';
import { getPost } from '../data/blog';

const fmtDate = (iso: string) =>
  new Date(iso + 'T00:00:00').toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });

const BlogPost: React.FC = () => {
  const { slug } = useParams();
  const post = slug ? getPost(slug) : undefined;
  if (!post) return <Navigate to="/blog" replace />;

  return (
    <SiteLayout>
      <article className="max-w-2xl mx-auto px-5 sm:px-6 py-12 sm:py-16">
        <Link to="/blog" className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors mb-8">
          <ArrowLeft size={16} /> Back to blog
        </Link>

        <div className={`h-44 sm:h-60 rounded-2xl bg-gradient-to-br ${post.cover} mb-8`} />

        <div className="flex items-center gap-3 text-[13px] text-[var(--color-text-muted)] mb-4 tabular-nums">
          <span>{fmtDate(post.date)}</span><span>·</span><span>{post.readingTime}</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight leading-tight mb-8">{post.title}</h1>

        <div className="space-y-5">
          {post.body.map((b, i) =>
            b.type === 'h2' ? (
              <h2 key={i} className="text-xl sm:text-2xl font-bold tracking-tight pt-4">{b.text}</h2>
            ) : (
              <p key={i} className="text-[var(--color-text-secondary)] text-[17px] leading-relaxed">{b.text}</p>
            )
          )}
        </div>
      </article>
    </SiteLayout>
  );
};

export default BlogPost;
