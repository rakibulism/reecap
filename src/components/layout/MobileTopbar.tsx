import React from 'react';
import { useReecapStore } from '../../store/reecapStore';
import { List, FilmStrip, Export } from 'phosphor-react';
import Button from '../ui/Button';
import { useExport } from '../../hooks/useExport';

/** Compact editor header for phones: menu · brand · export. */
const MobileTopbar: React.FC = () => {
  const { toggleSidebar, isExporting, exportProgress } = useReecapStore();
  const { startExport } = useExport();

  return (
    <header
      className="h-12 shrink-0 border-b border-[var(--color-border-default)] flex items-center justify-between px-3 bg-[var(--color-bg-page)] z-10"
      style={{ paddingTop: 'env(safe-area-inset-top)' }}
    >
      <button
        onClick={toggleSidebar}
        className="p-2 -ml-1 text-[var(--color-text-primary)] active:scale-90 transition-transform"
        aria-label="Menu"
      >
        <List size={22} weight="bold" />
      </button>

      <div className="flex items-center gap-1.5">
        <FilmStrip size={20} weight="bold" className="text-[var(--color-primary)]" />
        <span className="text-[15px] font-bold tracking-tight">Reecap</span>
      </div>

      <Button
        variant="primary"
        size="sm"
        icon={<Export size={16} weight="bold" />}
        onClick={startExport}
        disabled={isExporting}
        className={`min-w-[76px] transition-all ${isExporting ? 'animate-pulse' : ''}`}
        progress={isExporting ? exportProgress : 0}
      >
        {isExporting ? `${exportProgress}%` : 'Export'}
      </Button>
    </header>
  );
};

export default MobileTopbar;
