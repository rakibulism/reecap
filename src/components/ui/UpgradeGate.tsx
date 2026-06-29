import React from 'react';
import { Crown, Check, PenNib, Record, ArrowLeft } from 'phosphor-react';
import { useReecapStore } from '../../store/reecapStore';

type Tool = 'design' | 'recorder';

const COPY: Record<Tool, { icon: React.ElementType; name: string; blurb: string; perks: string[] }> = {
  design: {
    icon: PenNib,
    name: 'Design',
    blurb: 'The infinite-canvas design tool — shapes, text, layers and a full inspector — is part of Reecap Pro.',
    perks: ['Infinite canvas with layers', 'Export PNG & SVG', 'Premium templates & assets'],
  },
  recorder: {
    icon: Record,
    name: 'Screen Recorder',
    blurb: 'Record your screen with auto click-zoom and export it — available on Reecap Pro.',
    perks: ['Screen capture with auto-zoom', 'Webcam, mic & system audio', 'Export MP4 or WebM'],
  },
};

/** Full-panel lock shown when a free user opens a Pro-only tool. */
const UpgradeGate: React.FC<{ tool: Tool }> = ({ tool }) => {
  const { openPremiumPrompt, setActiveView } = useReecapStore();
  const c = COPY[tool];
  const Icon = c.icon;

  return (
    <div className="flex-1 flex items-center justify-center px-6 bg-[var(--color-bg-page)]">
      <div className="w-full max-w-md text-center">
        <div className="mx-auto mb-5 w-14 h-14 rounded-2xl bg-[var(--color-primary)]/10 text-[var(--color-primary)] flex items-center justify-center">
          <Icon size={28} weight="duotone" />
        </div>
        <div className="inline-flex items-center gap-1.5 mb-3 px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[11px] font-bold uppercase tracking-wide">
          <Crown size={13} weight="fill" /> Pro feature
        </div>
        <h1 className="text-2xl font-bold tracking-tight">{c.name} is a Pro tool</h1>
        <p className="mt-3 text-[var(--color-text-secondary)] leading-relaxed">{c.blurb}</p>

        <ul className="mt-5 inline-flex flex-col gap-2 text-left">
          {c.perks.map((p) => (
            <li key={p} className="flex items-center gap-2.5 text-[13px] text-[var(--color-text-secondary)]">
              <Check size={15} weight="bold" className="text-[var(--color-primary)] shrink-0" />
              {p}
            </li>
          ))}
        </ul>

        <div className="mt-7 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={openPremiumPrompt}
            className="inline-flex items-center justify-center gap-2 h-11 px-6 rounded-[var(--radius-md)] bg-[var(--color-primary)] text-white text-[14px] font-bold hover:opacity-90 transition-opacity"
          >
            <Crown size={17} weight="fill" /> Upgrade to Pro
          </button>
          <button
            onClick={() => setActiveView('editor')}
            className="inline-flex items-center justify-center gap-1.5 h-11 px-5 rounded-[var(--radius-md)] border border-[var(--color-border-default)] text-[14px] font-semibold text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)] transition-colors"
          >
            <ArrowLeft size={16} /> Back to Video
          </button>
        </div>
      </div>
    </div>
  );
};

export default UpgradeGate;
