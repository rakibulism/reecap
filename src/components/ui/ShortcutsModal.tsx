import React from 'react';
import { X } from 'phosphor-react';
import Button from './Button';

interface ShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Shortcut { keys: string; desc: string; }
interface Section { title: string; items: Shortcut[]; }

const SECTIONS: Section[] = [
  {
    title: 'General',
    items: [
      { keys: 'Space', desc: 'Play / Pause' },
      { keys: '?  ·  Cmd + K', desc: 'Show keyboard shortcuts' },
      { keys: 'Esc', desc: 'Close panels & modals' },
    ],
  },
  {
    title: 'Video Editor',
    items: [
      { keys: 'Alt + N', desc: 'New video project' },
      { keys: '←  /  →', desc: 'Previous / Next photo' },
      { keys: 'Cmd + U', desc: 'Upload images' },
      { keys: 'Shift + E', desc: 'Export video' },
      { keys: 'Shift + S', desc: 'Cycle theme' },
    ],
  },
  {
    title: 'Design',
    items: [
      { keys: 'V', desc: 'Select tool' },
      { keys: 'H  ·  Space', desc: 'Hand / pan canvas' },
      { keys: 'F', desc: 'Frame tool' },
      { keys: 'R', desc: 'Rectangle' },
      { keys: 'O', desc: 'Ellipse' },
      { keys: 'L  /  A', desc: 'Line / Arrow' },
      { keys: 'P', desc: 'Pen' },
      { keys: 'T', desc: 'Text' },
      { keys: 'Cmd + D', desc: 'Duplicate' },
      { keys: 'Del  /  ⌫', desc: 'Delete' },
      { keys: ']  /  Cmd + ]', desc: 'Bring forward / to front' },
      { keys: '[  /  Cmd + [', desc: 'Send backward / to back' },
      { keys: 'Cmd + +  /  Cmd + −', desc: 'Zoom in / out' },
      { keys: 'Cmd + 0', desc: 'Reset view' },
    ],
  },
  {
    title: 'Motion Design',
    items: [
      { keys: 'Cmd + D', desc: 'Duplicate layer' },
      { keys: 'Del  /  ⌫', desc: 'Delete layer' },
      { keys: 'Cmd + G', desc: 'Group selected layers' },
      { keys: 'Cmd + Shift + G', desc: 'Ungroup' },
      { keys: ']  /  Cmd + ]', desc: 'Bring forward / to front' },
      { keys: '[  /  Cmd + [', desc: 'Send backward / to back' },
      { keys: 'Cmd + V', desc: 'Paste Figma frame or image' },
      { keys: 'Shift + click', desc: 'Select layer range (timeline)' },
      { keys: 'Cmd + click', desc: 'Toggle layer in selection' },
    ],
  },
];

const ShortcutsModal: React.FC<ShortcutsModalProps> = ({ isOpen, onClose }) => {
  React.useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-[var(--color-bg-surface)] border border-[var(--color-border-default)] rounded-[var(--radius-md)] shadow-[var(--shadow-md)] overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[85vh]">
        <div className="flex items-center justify-between px-4 h-12 border-b border-[var(--color-border-default)] shrink-0">
          <span className="text-[13px] font-semibold uppercase tracking-wider text-[var(--color-text-primary)]">
            Keyboard Shortcuts
          </span>
          <Button variant="ghost" size="sm" onClick={onClose} icon={<X size={16} />} />
        </div>

        <div className="overflow-y-auto custom-scrollbar py-1">
          {SECTIONS.map((section) => (
            <div key={section.title} className="py-1.5">
              <h3 className="px-4 pt-2 pb-1 text-[10px] font-bold uppercase tracking-[0.1em] text-[var(--color-text-muted)]">
                {section.title}
              </h3>
              {section.items.map((s, i) => (
                <div
                  key={i}
                  className="px-4 py-2 flex items-center justify-between gap-3"
                >
                  <span className="text-[13px] text-[var(--color-text-secondary)]">{s.desc}</span>
                  <kbd className="px-2 py-1 bg-[var(--color-bg-panel)] border border-[var(--color-border-default)] rounded-[var(--radius-sm)] text-[11px] font-medium text-[var(--color-text-primary)] shadow-sm whitespace-nowrap shrink-0">
                    {s.keys}
                  </kbd>
                </div>
              ))}
            </div>
          ))}
        </div>

        <div className="p-4 bg-[var(--color-bg-panel)] border-t border-[var(--color-border-default)] shrink-0">
          <Button variant="primary" className="w-full" onClick={onClose}>
            Got it
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ShortcutsModal;
