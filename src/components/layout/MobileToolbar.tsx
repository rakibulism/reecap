import React from 'react';
import { ImageSquare, MusicNotes, FrameCorners, Sliders, type IconProps } from 'phosphor-react';

export type MobileSheet = 'none' | 'media' | 'music' | 'format' | 'adjust';

interface MobileToolbarProps {
  active: MobileSheet;
  onSelect: (sheet: MobileSheet) => void;
}

const TABS: { id: Exclude<MobileSheet, 'none'>; label: string; icon: React.ComponentType<IconProps> }[] = [
  { id: 'media', label: 'Photos', icon: ImageSquare },
  { id: 'music', label: 'Music', icon: MusicNotes },
  { id: 'format', label: 'Format', icon: FrameCorners },
  { id: 'adjust', label: 'Adjust', icon: Sliders },
];

/** Fixed bottom tab bar — each tab opens its bottom sheet of controls. */
const MobileToolbar: React.FC<MobileToolbarProps> = ({ active, onSelect }) => (
  <nav
    className="shrink-0 border-t border-[var(--color-border-default)] bg-[var(--color-bg-page)] flex items-stretch"
    style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
  >
    {TABS.map(({ id, label, icon: Icon }) => {
      const isActive = active === id;
      return (
        <button
          key={id}
          onClick={() => onSelect(isActive ? 'none' : id)}
          className={`flex-1 flex flex-col items-center justify-center gap-1 py-2.5 transition-colors active:scale-95
            ${isActive
              ? 'text-[var(--color-primary)]'
              : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]'}`}
        >
          <Icon size={22} weight={isActive ? 'fill' : 'regular'} />
          <span className="text-[10px] font-semibold tracking-tight">{label}</span>
        </button>
      );
    })}
  </nav>
);

export default MobileToolbar;
