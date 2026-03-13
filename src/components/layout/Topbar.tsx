import React from 'react';
import { useReecapStore } from '../../store/reecapStore';
import { 
  Sun, 
  Moon, 
  Export, 
  GithubLogo, 
  TwitterLogo, 
  Keyboard, 
  Monitor,
  List
} from 'phosphor-react';
import Button from '../ui/Button';
import SegmentedControl from '../ui/SegmentedControl';
import Tooltip from '../ui/Tooltip';
import { useExport } from '../../hooks/useExport';

const Topbar: React.FC = () => {
  const { 
    theme, setTheme, settings, updateSettings, 
    isExporting, exportProgress, setShowShortcuts,
    toggleSidebar
  } = useReecapStore();
  const { startExport } = useExport();

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
        <span className="text-[16px] font-bold text-[var(--color-text-primary)] tracking-tight">
          Reecap
        </span>
        <div className="flex items-center gap-1 border-l border-[var(--color-border-default)] pl-4">
          <Tooltip content="Follow on X" position="bottom">
            <a href="https://x.com/rakibulism" target="_blank" rel="noopener noreferrer">
              <Button variant="ghost" size="sm" icon={<TwitterLogo size={18} />} />
            </a>
          </Tooltip>
          <Tooltip content="View GitHub Repo" position="bottom">
            <a href="https://github.com/rakibulism/reecap" target="_blank" rel="noopener noreferrer">
              <Button variant="ghost" size="sm" icon={<GithubLogo size={18} />} />
            </a>
          </Tooltip>
        </div>
      </div>

      <div className="flex-1 flex justify-center">
        <SegmentedControl
          options={aspectRatioOptions}
          value={settings.aspectRatio}
          onChange={(v) => updateSettings({ aspectRatio: v as any })}
          className="max-w-[320px]"
        />
      </div>

      <div className="flex items-center gap-3">
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

        <div className="flex items-center bg-[var(--color-bg-panel)] border border-[var(--color-border-default)] rounded-[var(--radius-sm)] p-1">
          <Tooltip content="Light" position="bottom">
            <button 
              onClick={() => setTheme('light')}
              className={`p-1 rounded-[2px] ${theme === 'light' ? 'bg-[var(--color-bg-surface)] text-[var(--color-text-primary)] shadow-sm' : 'text-[var(--color-text-muted)]'}`}
            >
              <Sun size={16} />
            </button>
          </Tooltip>
          <Tooltip content="Dark" position="bottom">
            <button 
              onClick={() => setTheme('dark')}
              className={`p-1 rounded-[2px] ${theme === 'dark' ? 'bg-[var(--color-bg-surface)] text-[var(--color-text-primary)] shadow-sm' : 'text-[var(--color-text-muted)]'}`}
            >
              <Moon size={16} />
            </button>
          </Tooltip>
          <Tooltip content="System" position="bottom">
            <button 
              onClick={() => setTheme('system')}
              className={`p-1 rounded-[2px] ${theme === 'system' ? 'bg-[var(--color-bg-surface)] text-[var(--color-text-primary)] shadow-sm' : 'text-[var(--color-text-muted)]'}`}
            >
              <Monitor size={16} />
            </button>
          </Tooltip>
        </div>

        <Tooltip content="Keyboard Shortcuts (?)" position="left">
          <Button variant="ghost" size="sm" onClick={() => setShowShortcuts(true)} icon={<Keyboard size={18} />} />
        </Tooltip>

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
      </div>
    </header>
  );
};

export default Topbar;
