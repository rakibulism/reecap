import React, { useState } from 'react';
import { useReecapStore } from '../../store/reecapStore';
import {
  Export,
  Keyboard,
  List,
  FileImage,
  FileCode,
  CaretDown,
} from 'phosphor-react';
import Button from '../ui/Button';
import BrandMark from '../ui/BrandMark';
import SegmentedControl from '../ui/SegmentedControl';
import Tooltip from '../ui/Tooltip';
import { useExport } from '../../hooks/useExport';
import { useDesignStore } from '../../store/designStore';
import { exportDesign } from '../../lib/designExport';

const Topbar: React.FC = () => {
  const {
    settings, updateSettings,
    isExporting, exportProgress, setShowShortcuts,
    toggleSidebar, activeView, setActiveView
  } = useReecapStore();
  const { startExport } = useExport();
  const [designMenu, setDesignMenu] = useState(false);
  const [designBusy, setDesignBusy] = useState(false);

  const isMotion = activeView === 'motion';
  const isDesign = activeView === 'design';
  const isRecorder = activeView === 'recorder';
  const isVideo = activeView === 'editor';

  const runDesignExport = async (format: 'png' | 'svg') => {
    setDesignMenu(false);
    setDesignBusy(true);
    try {
      const { doc } = useDesignStore.getState();
      await exportDesign(format, doc.nodes, doc.background);
    } finally {
      setDesignBusy(false);
    }
  };

  const aspectRatioOptions = [
    { label: '16:9', value: '16:9' },
    { label: '4:3', value: '4:3' },
    { label: '5:4', value: '5:4' },
    { label: '1:1', value: '1:1' },
    { label: '9:16', value: '9:16' },
  ];

  return (
    <header className="h-12 border-b border-[var(--color-border-default)] flex items-center justify-between px-4 bg-[var(--color-bg-page)] z-10">
      <div className="flex items-center gap-2">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={toggleSidebar} 
          icon={<List size={22} weight="bold" />} 
          className="mr-1"
        />
        <BrandMark size={28} rounded="rounded-lg" className="ml-2" />
        <span className="text-[16px] font-bold text-[var(--color-text-primary)] tracking-tight">
          Reecap
        </span>
        {/* Tool mode switch: Video editor ↔ Motion design ↔ Design */}
        <div className="border-l border-[var(--color-border-default)] pl-3 ml-1">
          <SegmentedControl
            options={[
              { label: 'Video', value: 'editor' },
              { label: 'Motion', value: 'motion' },
              { label: 'Design', value: 'design' },
              { label: 'Record', value: 'recorder' },
            ]}
            value={isMotion ? 'motion' : isDesign ? 'design' : isRecorder ? 'recorder' : 'editor'}
            onChange={(v) => setActiveView(v as any)}
            className="w-[280px]"
          />
        </div>
      </div>

      <div className="flex-1 flex justify-center">
        {isVideo && (
          <SegmentedControl
            options={aspectRatioOptions}
            value={settings.aspectRatio}
            onChange={(v) => updateSettings({ aspectRatio: v as any })}
            className="max-w-[320px]"
          />
        )}
      </div>

      <div className="flex items-center gap-3">
        {isVideo && (
          <>
            <div className="flex items-center bg-[var(--color-bg-panel)] border border-[var(--color-border-default)] rounded-[var(--radius-sm)] p-1">
              {(['1x', '2x'] as const).map((q) => (
                <button
                  key={q}
                  onClick={() => updateSettings({ exportQuality: q })}
                  className={`px-2 h-6 text-[11px] font-semibold rounded-[2px] transition-all
                    ${settings.exportQuality === q
                      ? 'bg-[var(--color-bg-surface)] text-[var(--color-text-primary)] shadow-sm'
                      : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]'}`}
                >
                  {q}
                </button>
              ))}
            </div>

            <div className="h-8 w-px bg-[var(--color-border-default)]" />
          </>
        )}

        <Tooltip content="Keyboard Shortcuts (?)" position="left">
          <Button variant="ghost" size="sm" onClick={() => setShowShortcuts(true)} icon={<Keyboard size={18} />} />
        </Tooltip>

        {isDesign ? (
          <div className="relative">
            <Button
              variant="primary"
              size="md"
              icon={<Export size={18} weight="bold" />}
              onClick={() => setDesignMenu((v) => !v)}
              disabled={designBusy}
              className={`min-w-[110px] ${designBusy ? 'animate-pulse' : ''}`}
            >
              {designBusy ? 'Exporting…' : 'Export'}
              <CaretDown size={13} weight="bold" className="ml-1 opacity-80" />
            </Button>
            {designMenu && (
              <>
                <div className="fixed inset-0 z-[60]" onClick={() => setDesignMenu(false)} />
                <div className="absolute right-0 mt-1.5 w-44 z-[61] rounded-[var(--radius-md)] border border-[var(--color-border-default)] bg-[var(--color-bg-surface)] shadow-[var(--shadow-md)] overflow-hidden py-1 animate-in fade-in zoom-in-95 duration-150">
                  <button onClick={() => runDesignExport('png')} className="w-full flex items-center gap-2.5 px-3 py-2 text-[13px] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)] hover:text-[var(--color-text-primary)]">
                    <FileImage size={17} /> Export PNG
                  </button>
                  <button onClick={() => runDesignExport('svg')} className="w-full flex items-center gap-2.5 px-3 py-2 text-[13px] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)] hover:text-[var(--color-text-primary)]">
                    <FileCode size={17} /> Export SVG
                  </button>
                </div>
              </>
            )}
          </div>
        ) : isMotion ? (
          <Tooltip content="Motion export is coming soon" position="left">
            <Button variant="primary" size="md" icon={<Export size={18} weight="bold" />} disabled className="min-w-[100px]">
              Export
            </Button>
          </Tooltip>
        ) : isRecorder ? null : (
          <Button
            variant="primary"
            size="md"
            icon={<Export size={18} weight="bold" />}
            onClick={startExport}
            disabled={isExporting}
            className={`min-w-[100px] transition-all ${isExporting ? 'animate-pulse' : ''}`}
            progress={isExporting ? exportProgress : 0}
          >
            {isExporting ? `${exportProgress}%` : 'Export'}
          </Button>
        )}
      </div>
    </header>
  );
};

export default Topbar;
