import React, { useEffect, useState } from 'react';
import { FolderOpen } from 'phosphor-react';
import { useReecapStore } from '../../store/reecapStore';
import {
  chooseSaveFolder,
  getSaveDir,
  fsAccessSupported,
  dirPickerSupported,
  type VideoSaveMode,
} from '../../lib/saveLocation';

/**
 * Where exported videos are saved — Downloads, a "Save as" prompt, or a fixed
 * folder the user picks. Mode persists to localStorage; the chosen folder is a
 * FileSystemDirectoryHandle kept in IndexedDB.
 */
const VideoSaveLocation: React.FC = () => {
  const { videoSaveMode, setVideoSaveMode } = useReecapStore();
  const [folderName, setFolderName] = useState<string | null>(null);

  useEffect(() => {
    getSaveDir().then((dir) => setFolderName(dir ? dir.name : null)).catch(() => {});
  }, []);

  const options: { value: VideoSaveMode; label: string; hint: string; disabled?: boolean }[] = [
    { value: 'download', label: 'Downloads', hint: 'Save automatically, no prompt' },
    { value: 'ask', label: 'Ask each time', hint: 'Pick the spot with a “Save as” dialog', disabled: !fsAccessSupported },
    { value: 'folder', label: 'A folder I choose', hint: 'Save straight into one folder', disabled: !dirPickerSupported },
  ];

  const choose = async (mode: VideoSaveMode) => {
    if (mode === 'folder') {
      // Pick a folder first (needs the click gesture); only switch if confirmed.
      const name = folderName && videoSaveMode === 'folder' ? folderName : await chooseSaveFolder();
      if (!name) return;
      setFolderName(name);
    }
    setVideoSaveMode(mode);
  };

  return (
    <div>
      <div className="space-y-2.5">
        {options.map((opt) => {
          const active = videoSaveMode === opt.value;
          return (
            <button
              key={opt.value}
              onClick={() => choose(opt.value)}
              disabled={opt.disabled}
              className={`w-full flex items-start gap-3 text-left p-3.5 rounded-[var(--radius-md)] border transition-colors
                ${active
                  ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/5'
                  : 'border-[var(--color-border-default)] bg-[var(--color-bg-surface)] hover:border-[var(--color-text-muted)]'}
                ${opt.disabled ? 'opacity-40 cursor-not-allowed' : ''}`}
            >
              <span
                className={`mt-0.5 w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center
                  ${active ? 'border-[var(--color-primary)]' : 'border-[var(--color-border-strong,var(--color-text-muted))]'}`}
              >
                {active && <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-primary)]" />}
              </span>
              <span className="flex-1 min-w-0">
                <span className="block text-[14px] font-semibold">{opt.label}</span>
                <span className="block text-[12px] text-[var(--color-text-muted)]">{opt.hint}</span>
              </span>
            </button>
          );
        })}
      </div>

      {videoSaveMode === 'folder' && (
        <div className="flex items-center justify-between gap-2 mt-3 px-1 text-[13px]">
          <span className="flex items-center gap-2 text-[var(--color-text-secondary)] truncate">
            <FolderOpen size={16} weight="duotone" className="text-[var(--color-primary)] shrink-0" />
            {folderName ? `Saving to: ${folderName}` : 'No folder chosen'}
          </span>
          <button
            onClick={() => choose('folder')}
            className="shrink-0 font-semibold text-[var(--color-interactive)] hover:underline"
          >
            Change
          </button>
        </div>
      )}

      {!fsAccessSupported && (
        <p className="mt-3 text-[12px] text-[var(--color-text-muted)] leading-relaxed">
          “Ask each time” and “A folder I choose” need a Chromium-based browser (Chrome, Edge, Brave).
          Other browsers fall back to the Downloads folder.
        </p>
      )}
    </div>
  );
};

export default VideoSaveLocation;
