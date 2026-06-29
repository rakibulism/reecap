import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useReecapStore } from '../../store/reecapStore';
import {
  X,
  User,
  Crown,
  Users,
  Gift,
  House,
  MagicWand,
  PenNib,
  Code,
  Record,
  GithubLogo,
  TwitterLogo,
  BookOpen,
  Lifebuoy,
  SignOut,
  CaretRight,
  Gear,
  Lock,
} from 'phosphor-react';
import Button from '../ui/Button';
import InstallButton from '../ui/InstallButton';
import LoginModal from '../ui/LoginModal';
import InviteModal from '../ui/InviteModal';
import { useDesignStore } from '../../store/designStore';

const REPO_URL = 'https://github.com/rakibulism/reecap';
const X_URL = 'https://x.com/rakibulism';

const MainSidebar: React.FC = () => {
  const {
    isSidebarOpen,
    toggleSidebar,
    activeView,
    setActiveView,
    isPremium,
    openPremiumPrompt,
    inviteCount,
    user,
    logout,
  } = useReecapStore();
  const navigate = useNavigate();
  const [loginOpen, setLoginOpen] = useState(false);
  const [inviteOpen, setInviteOpen] = useState(false);

  if (!isSidebarOpen) return null;

  const NavItem = ({
    icon: Icon,
    label,
    id,
    badge,
    locked,
    onClick,
  }: {
    icon: any;
    label: string;
    id?: string;
    badge?: string;
    locked?: boolean;
    onClick?: () => void;
  }) => (
    <button
      onClick={() => {
        if (onClick) onClick();
        else if (id) setActiveView(id as any);
      }}
      className={`w-full flex items-center justify-between gap-2 px-4 py-3 rounded-[var(--radius-md)] transition-all group
        ${activeView === id
          ? 'bg-[var(--color-bg-hover)] text-[var(--color-text-primary)]'
          : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)] hover:text-[var(--color-text-primary)]'}`}
    >
      <div className="flex items-center gap-3 min-w-0">
        <Icon size={20} weight={activeView === id ? 'fill' : 'regular'} className="shrink-0" />
        <span className="text-[14px] font-medium truncate">{label}</span>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {badge && (
          <span className="bg-blue-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold whitespace-nowrap">
            {badge}
          </span>
        )}
        {locked && <Lock size={13} weight="fill" className="text-[var(--color-text-muted)]" />}
        <CaretRight size={14} className="opacity-0 group-hover:opacity-40 transition-opacity" />
      </div>
    </button>
  );

  // External link styled to match NavItem (anchors can't reuse NavItem's <button>).
  const LinkItem = ({
    icon: Icon,
    label,
    href,
    external,
  }: {
    icon: any;
    label: string;
    href: string;
    external?: boolean;
  }) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="w-full flex items-center gap-3 px-4 py-3 rounded-[var(--radius-md)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)] hover:text-[var(--color-text-primary)] transition-all"
    >
      <Icon size={20} className="shrink-0" />
      <span className="text-[14px] font-medium truncate">{label}</span>
      {external && <CaretRight size={12} className="ml-auto opacity-30" />}
    </a>
  );

  const signOut = () => {
    logout();
    toggleSidebar();
    navigate('/');
  };

  return (
    <div className="fixed inset-0 z-[2000] flex">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/20 backdrop-blur-sm animate-in fade-in"
        onClick={toggleSidebar}
      />

      {/* Sidebar Content */}
      <aside className="relative w-[280px] bg-[var(--color-bg-surface)] border-r border-[var(--color-border-default)] h-full shadow-[var(--shadow-md)] flex flex-col animate-in slide-in-from-left duration-300">
        <div className="h-14 border-b border-[var(--color-border-default)] flex items-center justify-between px-4">
          <div className="flex items-center gap-3 min-w-0">
            {user ? (
              <img
                src={user.avatar}
                alt={user.name}
                referrerPolicy="no-referrer"
                className="w-9 h-9 rounded-full object-cover border-2 border-[var(--color-primary)] shrink-0"
              />
            ) : (
              <div className="w-9 h-9 rounded-full bg-blue-500 flex items-center justify-center text-white shadow-sm shrink-0">
                <Crown size={18} weight="fill" />
              </div>
            )}
            <div className="min-w-0">
              <div className="text-[14px] font-bold tracking-tight truncate">
                {user ? user.name : 'Reecap'}
              </div>
              <div className="text-[10px] text-[var(--color-text-muted)] font-medium uppercase tracking-wide">
                {user ? `${user.plan} plan` : 'Guest'}
              </div>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={toggleSidebar} icon={<X size={18} />} />
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-6 custom-scrollbar">
          <nav className="space-y-1">
            <NavItem icon={House} label="Video Editor" id="editor" />
            <NavItem icon={MagicWand} label="Motion Design" id="motion" />
            <NavItem icon={PenNib} label="Design" id="design" badge="New" locked={!isPremium} />
            {/* Dev tool lives inside the Design tool */}
            <button
              onClick={() => {
                setActiveView('design');
                if (!useDesignStore.getState().devMode) useDesignStore.getState().toggleDevMode();
                toggleSidebar();
              }}
              className="w-full flex items-center gap-3 pl-11 pr-4 py-2.5 rounded-[var(--radius-md)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)] hover:text-[var(--color-text-primary)] transition-all"
            >
              <Code size={16} className="shrink-0" />
              <span className="text-[13px] font-medium truncate">Dev tool</span>
            </button>
            <NavItem icon={Record} label="Screen Recorder" id="recorder" badge="New" locked={!isPremium} />
            <NavItem icon={Users} label="Community" id="community" badge="New" />
          </nav>

          <div className="h-px bg-[var(--color-border-default)] mx-1" />

          <div className="space-y-4">
            <h4 className="text-[11px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider px-1">Account</h4>
            <div className="space-y-1">
              {user ? (
                <NavItem icon={User} label="Switch account" onClick={() => setLoginOpen(true)} />
              ) : (
                <NavItem icon={User} label="Login / Register" onClick={() => setLoginOpen(true)} />
              )}
              <NavItem
                icon={Crown}
                label={isPremium ? 'Manage Premium' : 'Subscribe Premium'}
                badge={isPremium ? 'Active' : ''}
                onClick={openPremiumPrompt}
              />
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-[11px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider px-1">Rewards</h4>
            <NavItem icon={Gift} label="Invite & Earn Audio" badge={`${inviteCount * 3}d`} onClick={() => setInviteOpen(true)} />
          </div>

          <div className="space-y-3">
            <h4 className="text-[11px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider px-1">Settings</h4>
            <div className="space-y-1">
              <NavItem
                icon={Gear}
                label="Settings"
                onClick={() => { toggleSidebar(); navigate('/settings'); }}
              />
              <LinkItem icon={BookOpen} label="Documentation" href="/docs" external />
              <LinkItem icon={Lifebuoy} label="Help & Support" href="/help" external />
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-[11px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider px-1">Connect</h4>
            <div className="space-y-1">
              <LinkItem icon={TwitterLogo} label="Follow on X" href={X_URL} />
              <LinkItem icon={GithubLogo} label="GitHub" href={REPO_URL} />
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-[var(--color-border-default)] bg-[var(--color-bg-panel)]/50">
          <InstallButton variant="solid" className="w-full justify-center mb-4" />
          {!isPremium && (
            <button
              onClick={openPremiumPrompt}
              className="w-full text-left bg-gradient-to-br from-amber-400/10 to-orange-500/10 border border-amber-500/25 rounded-[var(--radius-md)] p-3 mb-4 hover:border-amber-500/50 transition-colors group"
            >
              <div className="flex items-center gap-2 mb-1 text-amber-600 dark:text-amber-400">
                <Crown size={16} weight="fill" />
                <span className="text-[12px] font-bold">Upgrade to Pro</span>
                <CaretRight size={12} className="ml-auto opacity-40 group-hover:translate-x-0.5 transition-transform" />
              </div>
              <p className="text-[11px] text-[var(--color-text-secondary)] leading-relaxed">
                Unlock 10,000+ tracks, 4K export, and more.
              </p>
            </button>
          )}
          <Button
            variant="ghost"
            onClick={signOut}
            className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50/10"
          >
            <SignOut size={18} className="mr-3" />
            <span className="text-[14px]">Sign Out</span>
          </Button>
        </div>
      </aside>

      <LoginModal isOpen={loginOpen} onClose={() => setLoginOpen(false)} />
      <InviteModal isOpen={inviteOpen} onClose={() => setInviteOpen(false)} />
    </div>
  );
};

export default MainSidebar;
