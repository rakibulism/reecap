import React, { useState } from 'react';
import { useReecapStore } from '../../store/reecapStore';
import {
  MusicNotes,
  Plus,
  ImageSquare,
  SelectionBackground,
  Gear,
  Question,
  BookOpen,
  Lifebuoy
} from 'phosphor-react';
import { processFiles } from '../../lib/utils';
import Tooltip from '../ui/Tooltip';
import ThemeToggle from '../ui/ThemeToggle';

const Sidebar: React.FC = () => {
  const { photos, addPhotos, audio, setAudio, setActiveView, activePanel, setActivePanel } = useReecapStore();
  const [popover, setPopover] = useState<'none' | 'settings' | 'help'>('none');

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);
    
    const validFiles = files.filter(f => 
      ['image/jpeg', 'image/png', 'image/webp'].includes(f.type)
    ).slice(0, 30 - photos.length);

    if (validFiles.length > 0) {
      const processed = await processFiles(validFiles);
      addPhotos(processed);
    }
  };

  const handleAudioUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    if (audio) URL.revokeObjectURL(audio.url);
    const url = URL.createObjectURL(file);
    setAudio({ url, name: file.name });
  };



  return (
    <aside className="w-[64px] border-r border-[var(--color-border-default)] flex flex-col bg-[var(--color-bg-panel)] relative z-30">
      <div className="flex-1 flex flex-col items-center py-4 gap-6">
        {/* Upload Action */}
        <div className="flex flex-col items-center gap-2">
          <label className="cursor-pointer">
            <input
              type="file"
              multiple
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={(e) => {
                handleFileUpload(e);
                e.target.value = '';
              }}
              disabled={photos.length >= 30}
            />
            <Tooltip content="Add Photos" position="right">
              <div className={`w-10 h-10 rounded-[var(--radius-sm)] flex items-center justify-center border-2 border-dashed border-[var(--color-border-default)] hover:border-[var(--color-interactive)] hover:text-[var(--color-interactive)] transition-all ${photos.length >= 30 ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}>
                <Plus size={20} />
              </div>
            </Tooltip>
          </label>
          <span className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-tighter">
            {photos.length}/30
          </span>
        </div>

        <div className="w-8 h-px bg-[var(--color-border-default)]" />

        {/* Audio Action */}
        <div className="flex flex-col items-center gap-2">
          <label className="cursor-pointer">
            <input
              type="file"
              accept="audio/*"
              className="hidden"
              onChange={(e) => {
                handleAudioUpload(e);
                e.target.value = '';
              }}
            />
            <Tooltip content={audio ? `Audio: ${audio.name}` : "Add Audio"} position="right">
              <div className={`w-10 h-10 rounded-[var(--radius-sm)] flex items-center justify-center border-2 border-dashed ${audio ? 'border-[var(--color-interactive)] bg-[var(--color-interactive)] text-[var(--color-text-inverse)]' : 'border-[var(--color-border-default)] hover:border-[var(--color-interactive)] hover:text-[var(--color-interactive)]'} transition-all cursor-pointer`}>
                <MusicNotes size={20} weight={audio ? "fill" : "regular"} />
              </div>
            </Tooltip>
          </label>
        </div>

        <div className="w-8 h-px bg-[var(--color-border-default)]" />

        {/* Asset Icons with Shelf Toggle */}
        <Tooltip content="Media Assets" position="right">
          <div 
            onClick={() => setActivePanel(activePanel === 'assets' ? 'none' : 'assets')}
            className={`w-10 h-10 rounded-[var(--radius-sm)] flex items-center justify-center transition-all cursor-pointer
              ${activePanel === 'assets' 
                ? 'bg-[var(--color-interactive)] text-[var(--color-text-inverse)] shadow-sm'
                : 'text-[var(--color-text-muted)] hover:bg-[var(--color-bg-hover)] hover:text-[var(--color-text-primary)]'}`}
          >
            <ImageSquare size={22} />
          </div>
        </Tooltip>

        <Tooltip content="Music Library" position="right">
          <div 
            onClick={() => setActivePanel(activePanel === 'music' ? 'none' : 'music')}
            className={`w-10 h-10 rounded-[var(--radius-sm)] flex items-center justify-center transition-all cursor-pointer
              ${activePanel === 'music' 
                ? 'bg-[var(--color-interactive)] text-[var(--color-text-inverse)] shadow-sm'
                : 'text-[var(--color-text-muted)] hover:bg-[var(--color-bg-hover)] hover:text-[var(--color-text-primary)]'}`}
          >
            <MusicNotes size={22} weight="duotone" />
          </div>
        </Tooltip>

        <Tooltip content="Community Hub" position="right">
          <div 
            onClick={() => {
              setActiveView('community');
              setActivePanel('none');
            }}
            className="w-10 h-10 rounded-[var(--radius-sm)] flex items-center justify-center text-[var(--color-text-muted)] hover:bg-[var(--color-bg-hover)] hover:text-[var(--color-text-primary)] transition-all cursor-pointer"
          >
            <SelectionBackground size={22} />
          </div>
        </Tooltip>
      </div>

      {/* Settings & Help */}
      <div className="relative p-3 flex flex-col items-center gap-2 border-t border-[var(--color-border-default)]">
        <Tooltip content="Settings" position="right">
          <button
            onClick={() => setPopover(popover === 'settings' ? 'none' : 'settings')}
            className={`w-10 h-10 rounded-[var(--radius-sm)] flex items-center justify-center transition-all
              ${popover === 'settings'
                ? 'bg-[var(--color-interactive)] text-[var(--color-text-inverse)] shadow-sm'
                : 'text-[var(--color-text-muted)] hover:bg-[var(--color-bg-hover)] hover:text-[var(--color-text-primary)]'}`}
          >
            <Gear size={22} weight={popover === 'settings' ? 'fill' : 'regular'} />
          </button>
        </Tooltip>

        <Tooltip content="Help & docs" position="right">
          <button
            onClick={() => setPopover(popover === 'help' ? 'none' : 'help')}
            className={`w-10 h-10 rounded-[var(--radius-sm)] flex items-center justify-center transition-all
              ${popover === 'help'
                ? 'bg-[var(--color-interactive)] text-[var(--color-text-inverse)] shadow-sm'
                : 'text-[var(--color-text-muted)] hover:bg-[var(--color-bg-hover)] hover:text-[var(--color-text-primary)]'}`}
          >
            <Question size={22} weight={popover === 'help' ? 'fill' : 'regular'} />
          </button>
        </Tooltip>

        {popover !== 'none' && (
          <>
            {/* Click-away backdrop */}
            <div className="fixed inset-0 z-[1999]" onClick={() => setPopover('none')} />

            <div className="absolute left-[calc(100%+8px)] bottom-3 z-[2000] w-52 p-3 rounded-[var(--radius-md)] bg-[var(--color-bg-surface)] border border-[var(--color-border-default)] shadow-[var(--shadow-md)] animate-in fade-in slide-in-from-left-1">
              {popover === 'settings' ? (
                <>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-muted)] mb-2.5 px-0.5">
                    Appearance
                  </p>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[12px] font-medium text-[var(--color-text-secondary)]">Theme</span>
                    <ThemeToggle />
                  </div>
                </>
              ) : (
                <>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-muted)] mb-2 px-0.5">
                    Help
                  </p>
                  <div className="flex flex-col gap-0.5">
                    <a
                      href="/docs"
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => setPopover('none')}
                      className="flex items-center gap-2.5 px-2 py-2 rounded-[var(--radius-sm)] text-[13px] font-medium text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)] hover:text-[var(--color-text-primary)] transition-colors"
                    >
                      <BookOpen size={16} /> Documentation
                    </a>
                    <a
                      href="/help"
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => setPopover('none')}
                      className="flex items-center gap-2.5 px-2 py-2 rounded-[var(--radius-sm)] text-[13px] font-medium text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)] hover:text-[var(--color-text-primary)] transition-colors"
                    >
                      <Lifebuoy size={16} /> Help &amp; Support
                    </a>
                  </div>
                </>
              )}
            </div>
          </>
        )}
      </div>
    </aside>
  );
};


export default Sidebar;
