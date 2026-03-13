import React from 'react';
import { useReecapStore } from '../../store/reecapStore';
import { 
  X, 
  User, 
  Crown, 
  Users, 
  Gift, 
  MusicNotes, 
  House,
  SignOut,
  CaretRight
} from 'phosphor-react';
import Button from '../ui/Button';

const MainSidebar: React.FC = () => {
  const { 
    isSidebarOpen, 
    toggleSidebar, 
    activeView, 
    setActiveView,
    isPremium,
    inviteCount
  } = useReecapStore();

  if (!isSidebarOpen) return null;

  const NavItem = ({ 
    icon: Icon, 
    label, 
    id, 
    badge,
    onClick 
  }: { 
    icon: any; 
    label: string; 
    id?: string;
    badge?: string;
    onClick?: () => void;
  }) => (
    <button
      onClick={() => {
        if (onClick) onClick();
        else if (id) setActiveView(id as any);
      }}
      className={`w-full flex items-center justify-between px-4 py-3 rounded-[var(--radius-md)] transition-all group
        ${activeView === id 
          ? 'bg-[var(--color-bg-hover)] text-[var(--color-text-primary)]' 
          : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)] hover:text-[var(--color-text-primary)]'}`}
    >
      <div className="flex items-center gap-3">
        <Icon size={20} weight={activeView === id ? "fill" : "regular"} />
        <span className="text-[14px] font-medium">{label}</span>
      </div>
      <div className="flex items-center gap-2">
        {badge && (
          <span className="bg-blue-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold">
            {badge}
          </span>
        )}
        <CaretRight size={14} className={`opacity-0 group-hover:opacity-40 transition-opacity`} />
      </div>
    </button>
  );

  return (
    <div className="fixed inset-0 z-[2000] flex">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/20 backdrop-blur-sm animate-in fade-in"
        onClick={toggleSidebar}
      />
      
      {/* Sidebar Content */}
      <aside className="relative w-[280px] bg-[var(--color-bg-surface)] border-r border-[var(--color-border-default)] h-full shadow-[var(--shadow-md)] flex flex-col animate-in slide-in-from-left duration-300">
        <div className="h-12 border-b border-[var(--color-border-default)] flex items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white shadow-sm">
              <Crown size={18} weight="fill" />
            </div>
            <span className="text-[15px] font-bold tracking-tight">Reecap Pro</span>
          </div>
          <Button variant="ghost" size="sm" onClick={toggleSidebar} icon={<X size={18} />} />
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-6">
          <nav className="space-y-1">
            <NavItem icon={House} label="Video Editor" id="editor" />
            <NavItem icon={Users} label="Community" id="community" />
          </nav>

          <div className="h-px bg-[var(--color-border-default)] mx-1" />

          <div className="space-y-4 px-2">
            <h4 className="text-[11px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider">Account</h4>
            <div className="space-y-1">
              <NavItem icon={User} label="Login / Register" />
              <NavItem 
                icon={Crown} 
                label="Subscribe Premium" 
                badge={isPremium ? "Active" : ""} 
              />
            </div>
          </div>

          <div className="space-y-4 px-2">
            <h4 className="text-[11px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider">Rewards</h4>
            <NavItem 
              icon={Gift} 
              label="Invite & Earn Audio" 
              badge={`${inviteCount * 3}d`}
            />
          </div>
        </div>

        <div className="p-4 border-t border-[var(--color-border-default)] bg-[var(--color-bg-panel)]/50">
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-[var(--radius-md)] p-3 mb-4">
            <div className="flex items-center gap-2 mb-1 text-blue-600 dark:text-blue-400">
              <MusicNotes size={16} weight="bold" />
              <span className="text-[12px] font-bold">Pro Audio</span>
            </div>
            <p className="text-[11px] text-[var(--color-text-secondary)] leading-relaxed">
              Unlock 10,000+ premium tracks with Pro.
            </p>
          </div>
          <Button variant="ghost" className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50/10">
            <SignOut size={18} className="mr-3" />
            <span className="text-[14px]">Sign Out</span>
          </Button>
        </div>
      </aside>
    </div>
  );
};

export default MainSidebar;
