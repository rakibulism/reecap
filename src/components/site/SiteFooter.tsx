import React from 'react';
import { Link } from 'react-router-dom';
import { FilmStrip, GithubLogo, TwitterLogo } from 'phosphor-react';

const REPO_URL = 'https://github.com/rakibulism/reecap';

const SiteFooter: React.FC = () => (
  <footer className="border-t border-[var(--color-border-default)]">
    <div className="max-w-6xl mx-auto px-6 py-12">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 mb-10">
        <div className="col-span-2 sm:col-span-1">
          <Link to="/" className="flex items-center gap-2.5 mb-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
              <FilmStrip size={16} weight="fill" className="text-white" />
            </div>
            <span className="font-bold">Reecap</span>
          </Link>
          <p className="text-sm text-[var(--color-text-muted)] leading-relaxed">Your week, in motion.</p>
        </div>

        <FooterCol title="Product" links={[
          { label: 'Open editor', to: '/app' },
          { label: 'Updates', to: '/updates' },
          { label: 'Docs', to: '/docs' },
        ]} />
        <FooterCol title="Resources" links={[
          { label: 'Blog', to: '/blog' },
          { label: 'Documentation', to: '/docs' },
        ]} />
        <FooterCol title="More" links={[
          { label: 'GitHub', href: REPO_URL },
          { label: 'X / Twitter', href: 'https://x.com/rakibulism' },
        ]} />
      </div>

      <div className="pt-8 border-t border-[var(--color-border-default)] flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-sm text-[var(--color-text-muted)]">© {new Date().getFullYear()} Reecap · MIT Licensed</p>
        <div className="flex items-center gap-4 text-[var(--color-text-muted)]">
          <a href={REPO_URL} target="_blank" rel="noopener noreferrer" aria-label="GitHub" className="hover:text-[var(--color-text-primary)] transition-colors"><GithubLogo size={20} /></a>
          <a href="https://x.com/rakibulism" target="_blank" rel="noopener noreferrer" aria-label="X" className="hover:text-[var(--color-text-primary)] transition-colors"><TwitterLogo size={20} /></a>
        </div>
      </div>
    </div>
  </footer>
);

const FooterCol: React.FC<{ title: string; links: { label: string; to?: string; href?: string }[] }> = ({ title, links }) => (
  <div>
    <h4 className="text-[11px] font-bold uppercase tracking-wider text-[var(--color-text-muted)] mb-3">{title}</h4>
    <ul className="space-y-2.5">
      {links.map((l) => (
        <li key={l.label}>
          {l.to ? (
            <Link to={l.to} className="text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors">{l.label}</Link>
          ) : (
            <a href={l.href} target="_blank" rel="noopener noreferrer" className="text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors">{l.label}</a>
          )}
        </li>
      ))}
    </ul>
  </div>
);

export default SiteFooter;
