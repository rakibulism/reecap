import React, { useEffect, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { GithubLogo, ArrowRight, List, X } from 'phosphor-react';
import Button from '../ui/Button';
import BrandMark from '../ui/BrandMark';
import InstallButton from '../ui/InstallButton';
import ThemeToggle from '../ui/ThemeToggle';
import NotificationBell from './NotificationBell';

const REPO_URL = 'https://github.com/rakibulism/reecap';

const NAV = [
  { to: '/', label: 'Home', end: true },
  { to: '/docs', label: 'Docs' },
  { to: '/help', label: 'Help' },
  { to: '/updates', label: 'Updates' },
  { to: '/blog', label: 'Blog' },
];

const SiteNav: React.FC = () => {
  const navigate = useNavigate();
  const [menu, setMenu] = useState(false);

  // Lock body scroll while the mobile menu is open.
  useEffect(() => {
    document.body.style.overflow = menu ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menu]);

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `transition-colors ${isActive ? 'text-[var(--color-text-primary)]' : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'}`;

  return (
    <header className="fixed top-0 inset-x-0 z-50 bg-[var(--color-bg-page)]/70 backdrop-blur-xl after:absolute after:inset-x-0 after:bottom-0 after:h-px after:bg-gradient-to-r after:from-transparent after:via-[var(--color-border-default)]/60 after:to-transparent" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5 shrink-0" onClick={() => setMenu(false)}>
          <BrandMark size={36} rounded="rounded-xl" />
          <span className="text-lg font-bold tracking-tight">Reecap</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium">
          {NAV.map((n) => (
            <NavLink key={n.to} to={n.to} end={n.end} className={linkClass}>{n.label}</NavLink>
          ))}
          <a href={REPO_URL} target="_blank" rel="noopener noreferrer" className="text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors">GitHub</a>
        </nav>

        {/* Desktop actions */}
        <div className="hidden md:flex items-center gap-1.5">
          <ThemeToggle className="mr-1" />
          <NotificationBell />
          <InstallButton variant="ghost" />
          <Button variant="primary" size="md" onClick={() => navigate('/app')} className="group ml-1">
            Open editor
            <ArrowRight size={16} className="ml-1.5 transition-transform group-hover:translate-x-0.5" />
          </Button>
        </div>

        {/* Mobile actions */}
        <div className="flex md:hidden items-center gap-1">
          <NotificationBell />
          <button
            onClick={() => setMenu((m) => !m)}
            aria-label={menu ? 'Close menu' : 'Open menu'}
            className="w-10 h-10 flex items-center justify-center rounded-[var(--radius-md)] text-[var(--color-text-primary)] hover:bg-[var(--color-bg-hover)]"
          >
            {menu ? <X size={22} weight="bold" /> : <List size={22} weight="bold" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menu && (
        <div className="md:hidden border-t border-[var(--color-border-default)] bg-[var(--color-bg-page)] animate-in fade-in slide-in-from-top-2">
          <nav className="px-4 py-4 flex flex-col gap-1">
            {NAV.map((n) => (
              <NavLink
                key={n.to}
                to={n.to}
                end={n.end}
                onClick={() => setMenu(false)}
                className={({ isActive }) =>
                  `px-3 py-3 rounded-[var(--radius-md)] text-base font-medium ${isActive ? 'bg-[var(--color-bg-hover)] text-[var(--color-text-primary)]' : 'text-[var(--color-text-secondary)]'}`}
              >
                {n.label}
              </NavLink>
            ))}
            <a href={REPO_URL} target="_blank" rel="noopener noreferrer" className="px-3 py-3 rounded-[var(--radius-md)] text-base font-medium text-[var(--color-text-secondary)] flex items-center gap-2">
              <GithubLogo size={18} /> GitHub
            </a>
            <div className="mt-3 flex items-center justify-between px-3 py-2">
              <span className="text-sm font-medium text-[var(--color-text-secondary)]">Theme</span>
              <ThemeToggle />
            </div>
            <div className="mt-1 flex flex-col gap-2">
              <InstallButton variant="solid" className="w-full justify-center h-12" />
              <Button variant="primary" size="lg" onClick={() => { setMenu(false); navigate('/app'); }} className="w-full justify-center h-12">
                Open editor
                <ArrowRight size={18} className="ml-2" />
              </Button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};

export default SiteNav;
