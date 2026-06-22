import React from 'react';
import { Link, useParams, Navigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight } from 'phosphor-react';
import SiteLayout from '../components/site/SiteLayout';
import { getPost, BLOG_POSTS } from '../data/blog';
import { useSeo, SITE_URL } from '../lib/seo';

const fmtDate = (iso: string) =>
  new Date(iso + 'T00:00:00').toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });

const BlogPost: React.FC = () => {
  const { slug } = useParams();
  const post = slug ? getPost(slug) : undefined;

  useSeo(
    post
      ? {
          title: `${post.title} | Reecap`,
          description: post.description,
          path: `/blog/${post.slug}`,
          type: 'article',
          keywords: post.keywords,
          jsonLd: [
            {
              '@context': 'https://schema.org',
              '@type': 'Article',
              headline: post.title,
              description: post.description,
              datePublished: post.date,
              dateModified: post.updated,
              author: { '@type': 'Person', name: post.author },
              publisher: { '@type': 'Organization', name: 'Reecap', url: SITE_URL },
              mainEntityOfPage: `${SITE_URL}/blog/${post.slug}`,
              keywords: post.keywords.join(', '),
            },
            {
              '@context': 'https://schema.org',
              '@type': 'FAQPage',
              mainEntity: post.faq.map((f) => ({
                '@type': 'Question',
                name: f.q,
                acceptedAnswer: { '@type': 'Answer', text: f.a },
              })),
            },
            {
              '@context': 'https://schema.org',
              '@type': 'BreadcrumbList',
              itemListElement: [
                { '@type': 'ListItem', position: 1, name: 'Blog', item: `${SITE_URL}/blog` },
                { '@type': 'ListItem', position: 2, name: post.title, item: `${SITE_URL}/blog/${post.slug}` },
              ],
            },
          ],
        }
      : { title: 'Blog | Reecap', description: 'Reecap blog.', path: '/blog' }
  );

  if (!post) return <Navigate to="/blog" replace />;

  const related = BLOG_POSTS.filter((p) => p.slug !== post.slug && p.category === post.category).slice(0, 2);

  return (
    <SiteLayout>
      <article className="max-w-2xl mx-auto px-5 sm:px-6 py-12 sm:py-16">
        <Link to="/blog" className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors mb-8">
          <ArrowLeft size={16} /> Back to blog
        </Link>

        <img
          src={`/blog/covers/${post.slug}.svg`}
          alt={post.title}
          width={1200}
          height={630}
          className={`w-full h-44 sm:h-60 object-cover rounded-2xl bg-gradient-to-br ${post.cover} mb-8`}
        />

        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] text-[var(--color-text-muted)] mb-4">
          <span className="font-semibold text-[var(--color-primary)] uppercase tracking-wide text-[11px]">{post.category}</span>
          <span>·</span><span className="tabular-nums">{fmtDate(post.date)}</span>
          <span>·</span><span>{post.readingTime}</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight leading-tight mb-3">{post.title}</h1>
        <p className="text-[13px] text-[var(--color-text-muted)] mb-8">By {post.author}</p>

        <div className="space-y-5">
          {post.body.map((b, i) => {
            if (b.type === 'h2') return <h2 key={i} className="text-xl sm:text-2xl font-bold tracking-tight pt-4">{b.text}</h2>;
            if (b.type === 'ul') return (
              <ul key={i} className="space-y-2.5">
                {b.items!.map((it) => (
                  <li key={it} className="flex gap-3 text-[var(--color-text-secondary)] text-[17px] leading-relaxed">
                    <span className="mt-2.5 w-1.5 h-1.5 rounded-full bg-[var(--color-primary)] shrink-0" />
                    {it}
                  </li>
                ))}
              </ul>
            );
            return <p key={i} className="text-[var(--color-text-secondary)] text-[17px] leading-relaxed">{b.text}</p>;
          })}
        </div>

        {/* FAQ — visible + drives FAQPage schema for answer engines */}
        {post.faq.length > 0 && (
          <section className="mt-12 pt-8 border-t border-[var(--color-border-default)]">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight mb-6">Frequently asked questions</h2>
            <div className="space-y-5">
              {post.faq.map((f) => (
                <div key={f.q}>
                  <h3 className="font-bold mb-1.5">{f.q}</h3>
                  <p className="text-[var(--color-text-secondary)] leading-relaxed">{f.a}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* CTA */}
        <div className="mt-12 p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-center">
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">Turn your photos into a recap</h2>
          <p className="text-blue-100 mb-5">Free, in your browser. No upload, no account.</p>
          <Link to="/app" className="inline-flex items-center gap-2 px-6 h-12 rounded-xl bg-white text-blue-700 font-bold hover:scale-[1.02] active:scale-95 transition-transform">
            Open the editor <ArrowRight size={16} weight="bold" />
          </Link>
        </div>

        {related.length > 0 && (
          <section className="mt-12">
            <h2 className="text-lg font-bold mb-4">Related reading</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {related.map((r) => (
                <Link key={r.slug} to={`/blog/${r.slug}`} className="p-4 rounded-xl border border-[var(--color-border-default)] hover:border-[var(--color-primary)]/40 transition-colors">
                  <span className="font-semibold text-[15px] hover:text-[var(--color-primary)] transition-colors">{r.title}</span>
                </Link>
              ))}
            </div>
          </section>
        )}
      </article>
    </SiteLayout>
  );
};

export default BlogPost;
