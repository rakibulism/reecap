import React from 'react';
import { X } from 'phosphor-react';

interface BottomSheetProps {
  open: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}

/** Mobile slide-up sheet that hosts a panel's controls over the canvas. */
const BottomSheet: React.FC<BottomSheetProps> = ({ open, title, onClose, children }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[2500] flex flex-col justify-end">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-in fade-in"
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className="relative bg-[var(--color-bg-surface)] border-t border-[var(--color-border-default)] rounded-t-2xl shadow-[var(--shadow-md)] flex flex-col max-h-[78vh] animate-in slide-in-from-bottom duration-300"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        {/* Grab handle */}
        <div className="pt-2.5 pb-1 flex justify-center shrink-0" onClick={onClose}>
          <div className="w-9 h-1 rounded-full bg-[var(--color-border-strong)]" />
        </div>

        {/* Header */}
        <div className="h-11 px-4 flex items-center justify-between shrink-0 border-b border-[var(--color-border-default)]">
          <h3 className="text-[13px] font-bold uppercase tracking-wider text-[var(--color-text-primary)]">
            {title}
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 -mr-1.5 text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] active:scale-90 transition-all"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto overscroll-contain custom-scrollbar">
          {children}
        </div>
      </div>
    </div>
  );
};

export default BottomSheet;
