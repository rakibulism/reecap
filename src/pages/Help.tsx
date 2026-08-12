import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, ChatCircleDots, GithubLogo, TwitterLogo, ArrowRight } from 'phosphor-react';
import SiteLayout from '../components/site/SiteLayout';
import { useSeo } from '../lib/seo';

const REPO_URL = 'https://github.com/rakibulism/reecap';
const X_URL = 'https://x.com/rakibulism';
const SUPPORT_EMAIL = '40rakib70@gmail.com';

interface Faq {
  q: string;
  a: string;
}

const FAQS: Faq[] = [
  {
    q: 'Is Reecap free?',
    a: 'Yes. Reecap runs entirely in your browser — there is no account to create and no upload step. Import photos, edit, and export an MP4 at no cost.',
  },
  {
    q: 'Where do my photos and videos go?',
    a: 'Nowhere. Reecap is 100% client-side: your media is processed on your device and never leaves your browser. There are no servers handling your files.',
  },
  {
    q: 'How do I export my video?',
    a: 'Press Export in the top-right of the editor. Reecap renders every frame at 30fps with WebCodecs, so transitions, captions, and music are baked into the downloaded MP4. Pick your aspect ratio and 720p/1080p quality first.',
  },
  {
    q: 'What is the Motion Design tool?',
    a: 'Switch to the Motion tab (top of the editor or the sidebar) for a layer-by-layer animation tool: add text, shapes, and images, give each layer an in/out animation preset, and scrub the timeline. You can also paste a frame from Figma using the Reecap Motion plugin. Motion export is coming soon.',
  },
  {
    q: 'Which browsers are supported?',
    a: 'Use a recent Chrome, Edge, or other Chromium-based browser for the best results — export relies on the WebCodecs API. Safari and Firefox work for editing, with export support improving over time.',
  },
  {
    q: 'Can I install Reecap as an app?',
    a: 'Yes. Use the Install button in the menu (or your browser’s “Install app” / “Add to Home Screen” option). Reecap installs as a PWA and launches straight into the editor.',
  },
];

const Help: React.FC = () => {
  useSeo({
    title: 'Help & Support — Reecap',
    description:
      'Get help with Reecap: answers to common questions about exporting, privacy, the Motion Design tool, browser support, and how to reach us.',
    path: '/help',
    keywords: ['reecap help', 'reecap support', 'reecap faq'],
  });

  return (
    <SiteLayout>
      <div className="max-w-4xl mx-auto px-5 sm:px-6 py-14 sm:py-20">
        <header className="mb-10">
          <p className="text-[13px] font-semibold uppercase tracking-[0.1em] text-[var(--color-primary)] mb-3">
            Help &amp; Support
          </p>
          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight">How can we help?</h1>
          <p className="mt-4 text-[var(--color-text-secondary)] leading-relaxed max-w-2xl">
            Answers to the most common questions, plus where to reach us if you’re stuck. Reecap is an
            open project — the fastest way to report a bug or request a feature is on GitHub.
          </p>
        </header>

        {/* Quick links */}
        <div className="grid sm:grid-cols-2 gap-3 mb-14">
          <Link
            to="/docs"
            className="group flex items-center gap-3 p-4 rounded-[var(--radius-md)] border border-[var(--color-border-default)] bg-[var(--color-bg-surface)] hover:border-[var(--color-primary)]/50 transition-colors"
          >
            <BookOpen size={22} weight="duotone" className="text-[var(--color-primary)] shrink-0" />
            <span className="flex-1">
              <span className="block text-[14px] font-semibold">Documentation</span>
              <span className="block text-[12px] text-[var(--color-text-muted)]">
                Step-by-step guides for every feature
              </span>
            </span>
            <ArrowRight size={16} className="text-[var(--color-text-muted)] transition-transform group-hover:translate-x-0.5" />
          </Link>

          <a
            href={`${REPO_URL}/issues/new`}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-3 p-4 rounded-[var(--radius-md)] border border-[var(--color-border-default)] bg-[var(--color-bg-surface)] hover:border-[var(--color-primary)]/50 transition-colors"
          >
            <ChatCircleDots size={22} weight="duotone" className="text-[var(--color-primary)] shrink-0" />
            <span className="flex-1">
              <span className="block text-[14px] font-semibold">Report an issue</span>
              <span className="block text-[12px] text-[var(--color-text-muted)]">
                Bugs &amp; feature requests on GitHub
              </span>
            </span>
            <ArrowRight size={16} className="text-[var(--color-text-muted)] transition-transform group-hover:translate-x-0.5" />
          </a>
        </div>

        {/* FAQ */}
        <section className="mb-14">
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight mb-6">Frequently asked questions</h2>
          <div className="space-y-4">
            {FAQS.map((f) => (
              <details
                key={f.q}
                className="group rounded-[var(--radius-md)] border border-[var(--color-border-default)] bg-[var(--color-bg-surface)] open:border-[var(--color-primary)]/40 transition-colors"
              >
                <summary className="cursor-pointer list-none flex items-center justify-between gap-3 px-4 py-3.5 text-[14px] font-semibold select-none">
                  {f.q}
                  <span className="text-[var(--color-text-muted)] transition-transform group-open:rotate-45 text-lg leading-none">+</span>
                </summary>
                <p className="px-4 pb-4 -mt-1 text-[13px] text-[var(--color-text-secondary)] leading-relaxed">
                  {f.a}
                </p>
              </details>
            ))}
          </div>
        </section>

        {/* Contact */}
        <section className="rounded-[var(--radius-lg)] border border-[var(--color-border-default)] bg-[var(--color-bg-panel)] p-6 sm:p-8">
          <h2 className="text-xl font-bold tracking-tight mb-2">Still need help?</h2>
          <p className="text-[var(--color-text-secondary)] leading-relaxed mb-5 max-w-2xl">
            Open an issue on GitHub for anything technical, email us for account or billing questions, or
            reach out on X. We read everything.
          </p>
          <div className="flex flex-wrap gap-3">
            <a
              href={`mailto:${SUPPORT_EMAIL}`}
              className="inline-flex items-center gap-2 h-10 px-4 rounded-[var(--radius-md)] bg-[var(--color-interactive)] text-[var(--color-text-inverse)] text-[14px] font-semibold hover:opacity-90 transition-opacity"
            >
              Email {SUPPORT_EMAIL}
            </a>
            <a
              href={`${REPO_URL}/issues`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 h-10 px-4 rounded-[var(--radius-md)] bg-[var(--color-interactive)] text-[var(--color-text-inverse)] text-[14px] font-semibold hover:opacity-90 transition-opacity"
            >
              <GithubLogo size={18} weight="fill" /> Open a GitHub issue
            </a>
            <a
              href={X_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 h-10 px-4 rounded-[var(--radius-md)] border border-[var(--color-border-default)] bg-[var(--color-bg-surface)] text-[14px] font-semibold hover:bg-[var(--color-bg-hover)] transition-colors"
            >
              <TwitterLogo size={18} weight="fill" /> Message on X
            </a>
          </div>
        </section>
      </div>
    </SiteLayout>
  );
};

export default Help;
