import React, { useEffect, useState } from 'react';
import { FolderOpen, WarningCircle } from 'phosphor-react';
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
  const [folderError, setFolderError] = useState<string | null>(null);

  useEffect(() => {
    getSaveDir().then((dir) => setFolderName(dir ? dir.name : null)).catch(() => {});
  }, []);

  const options: { value: VideoSaveMode; label: string; hint: string; disabled?: boolean }[] = [
    { value: 'download', label: 'Downloads', hint: 'Save automatically, no prompt' },
    { value: 'ask', label: 'Ask each time', hint: 'Pick the spot with a “Save as” dialog', disabled: !fsAccessSupported },
    { value: 'folder', label: 'A folder I choose', hint: 'Save straight into one folder', disabled: !dirPickerSupported },
  ];

  const pickFolder = async () => {
    setFolderError(null);
    const res = await chooseSaveFolder();
    if (res.ok) {
      setFolderName(res.name);
      setVideoSaveMode('folder');
    } else if (res.reason === 'blocked') {
      setFolderError(
        "That folder can't be used — your browser blocks system-protected folders. Pick a regular folder (e.g. a new subfolder inside Movies or Documents), not your home folder, Desktop, or a drive root.",
      );
    }
  };

  const choose = async (mode: VideoSaveMode) => {
    if (mode === 'folder') {
      // Already have a folder and re-selecting "folder" → just keep it. Otherwise
      // open the picker (needs the click gesture) and only switch if confirmed.
      if (folderName && videoSaveMode === 'folder') return;
      await pickFolder();
      return;
    }
    setFolderError(null);
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
            onClick={pickFolder}
            className="shrink-0 font-semibold text-[var(--color-interactive)] hover:underline"
          >
            Change
          </button>
        </div>
      )}

      {folderError && (
        <div className="flex items-start gap-2 mt-3 p-3 rounded-[var(--radius-md)] border border-red-500/30 bg-red-500/5 text-[12px] text-[var(--color-text-secondary)] leading-relaxed">
          <WarningCircle size={16} weight="fill" className="text-red-500 shrink-0 mt-px" />
          <span>{folderError}</span>
        </div>
      )}

      {dirPickerSupported && (
        <p className="mt-3 text-[12px] text-[var(--color-text-muted)] leading-relaxed">
          Tip: choose a normal folder you own — system folders (your home folder, Desktop, or a drive root) are blocked by the browser.
        </p>
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
