import React, { useState } from 'react';
import { useReecapStore } from '../../store/reecapStore';
import MobileTopbar from './MobileTopbar';
import MobileToolbar, { type MobileSheet } from './MobileToolbar';
import Canvas from './Canvas';
import Timeline from './Timeline';
import ControlPanel from './ControlPanel';
import MediaShelf from './MediaShelf';
import CommunityHub from '../community/CommunityHub';
import BottomSheet from '../ui/BottomSheet';

const ASPECT_RATIOS = ['16:9', '4:3', '5:4', '1:1', '9:16'] as const;
const SHEET_TITLES: Record<Exclude<MobileSheet, 'none'>, string> = {
  media: 'Photos',
  music: 'Music',
  format: 'Format',
  adjust: 'Adjust',
};

/** Phone-first editor shell: vertical stack + bottom tabs that open sheets. */
const MobileEditor: React.FC = () => {
  const { activeView, settings, updateSettings, setActivePanel } = useReecapStore();
  const [sheet, setSheet] = useState<MobileSheet>('none');

  const openSheet = (next: MobileSheet) => {
    if (next === 'media') setActivePanel('assets');
    else if (next === 'music') setActivePanel('music');
    setSheet(next);
  };

  const closeSheet = () => {
    setActivePanel('none');
    setSheet('none');
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <MobileTopbar />

      {activeView === 'editor' ? (
        <>
          <div className="flex-1 min-h-0 relative flex flex-col overflow-hidden">
            <Canvas />
          </div>
          <Timeline />
          <MobileToolbar active={sheet} onSelect={openSheet} />
        </>
      ) : (
        <div className="flex-1 min-h-0 overflow-y-auto">
          <CommunityHub />
        </div>
      )}

      <BottomSheet
        open={sheet !== 'none'}
        title={sheet === 'none' ? '' : SHEET_TITLES[sheet]}
        onClose={closeSheet}
      >
        {sheet === 'adjust' && <ControlPanel mobile />}
        {(sheet === 'media' || sheet === 'music') && <MediaShelf mobile />}
        {sheet === 'format' && (
          <div className="p-5 space-y-6">
            <div>
              <label className="text-[11px] font-medium uppercase tracking-[0.08em] text-[var(--color-text-muted)] block mb-3">
                Aspect Ratio
              </label>
              <div className="grid grid-cols-5 gap-2">
                {ASPECT_RATIOS.map((r) => (
                  <button
                    key={r}
                    onClick={() => updateSettings({ aspectRatio: r })}
                    className={`h-10 rounded-[var(--radius-sm)] text-[12px] font-semibold transition-all border
                      ${settings.aspectRatio === r
                        ? 'bg-[var(--color-interactive)] border-[var(--color-interactive)] text-[var(--color-text-inverse)]'
                        : 'bg-[var(--color-bg-surface)] border-[var(--color-border-default)] text-[var(--color-text-muted)]'}`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-[11px] font-medium uppercase tracking-[0.08em] text-[var(--color-text-muted)] block mb-3">
                Export Quality
              </label>
              <div className="grid grid-cols-2 gap-2">
                {(['1x', '2x'] as const).map((q) => (
                  <button
                    key={q}
                    onClick={() => updateSettings({ exportQuality: q })}
                    className={`h-10 rounded-[var(--radius-sm)] text-[12px] font-semibold transition-all border
                      ${settings.exportQuality === q
                        ? 'bg-[var(--color-interactive)] border-[var(--color-interactive)] text-[var(--color-text-inverse)]'
                        : 'bg-[var(--color-bg-surface)] border-[var(--color-border-default)] text-[var(--color-text-muted)]'}`}
                  >
                    {q === '1x' ? '1x · Standard' : '2x · High'}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </BottomSheet>
    </div>
  );
};

export default MobileEditor;
