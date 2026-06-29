import React from 'react';
import { useReecapStore } from '../../store/reecapStore';
import {
  MusicNotes,
  Plus,
  ImageSquare,
  SelectionBackground,
  Files,
  SidebarSimple,
} from 'phosphor-react';
import { processFiles } from '../../lib/utils';
import Tooltip from '../ui/Tooltip';

const Sidebar: React.FC = () => {
  const {
    photos, addPhotos, audio, setAudio, setActiveView, activePanel, setActivePanel,
    isPremium, openPremiumPrompt, setDraftsOpen, controlPanelOpen, toggleControlPanel,
  } = useReecapStore();

  const openDrafts = () => (isPremium ? setDraftsOpen(true) : openPremiumPrompt());

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

      {/* Bottom: drafts + collapse the settings panel */}
      <div className="flex flex-col items-center gap-3 pb-4 pt-2">
        <div className="w-8 h-px bg-[var(--color-border-default)]" />
        <Tooltip content="Drafts" position="right">
          <div
            onClick={openDrafts}
            className="w-10 h-10 rounded-[var(--radius-sm)] flex items-center justify-center text-[var(--color-text-muted)] hover:bg-[var(--color-bg-hover)] hover:text-[var(--color-text-primary)] transition-all cursor-pointer"
          >
            <Files size={22} />
          </div>
        </Tooltip>
        <Tooltip content={controlPanelOpen ? 'Hide settings panel' : 'Show settings panel'} position="right">
          <div
            onClick={toggleControlPanel}
            className={`w-10 h-10 rounded-[var(--radius-sm)] flex items-center justify-center transition-all cursor-pointer
              ${controlPanelOpen
                ? 'text-[var(--color-text-muted)] hover:bg-[var(--color-bg-hover)] hover:text-[var(--color-text-primary)]'
                : 'bg-[var(--color-interactive)] text-[var(--color-text-inverse)] shadow-sm'}`}
          >
            <SidebarSimple size={22} style={{ transform: 'scaleX(-1)' }} />
          </div>
        </Tooltip>
      </div>
    </aside>
  );
};


export default Sidebar;
