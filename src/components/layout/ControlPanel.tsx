import React, { useState, useMemo } from 'react';
import { useReecapStore } from '../../store/reecapStore';
import Slider from '../ui/Slider';
import SegmentedControl from '../ui/SegmentedControl';
import { SpeakerHigh, Trash, MagnifyingGlass, MusicNotes, Plus } from 'phosphor-react';
import { COMMUNITY_TRACKS } from '../../data/communityAudio';

const ControlPanel: React.FC = () => {
  const { settings, updateSettings, audio, setAudio } = useReecapStore();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTracks = useMemo(() => {
    if (!searchQuery) return COMMUNITY_TRACKS;
    const query = searchQuery.toLowerCase();
    return COMMUNITY_TRACKS.filter(t => 
      t.name.toLowerCase().includes(query) || 
      t.tags.some(tag => tag.includes(query))
    );
  }, [searchQuery]);

  const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div className="py-6 border-b border-[var(--color-border-default)] last:border-0 px-5">
      <h3 className="text-[11px] font-medium uppercase tracking-[0.08em] text-[var(--color-text-muted)] mb-5">
        {title}
      </h3>
      <div className="flex flex-col gap-5">
        {children}
      </div>
    </div>
  );

  return (
    <aside className="w-[280px] border-l border-[var(--color-border-default)] flex flex-col bg-[var(--color-bg-panel)] overflow-y-auto">
      <Section title="Animation">
        <Slider
          label="Duration"
          value={settings.duration}
          min={0.2}
          max={5.0}
          step={0.1}
          unit="s"
          onChange={(v) => updateSettings({ duration: v })}
        />
        <div>
          <label className="text-[11px] font-medium uppercase tracking-[0.08em] text-[var(--color-text-muted)] block mb-2">
            Transition
          </label>
          <SegmentedControl
            options={[
              { label: 'Fade', value: 'fade' },
              { label: 'Slide', value: 'slide' },
              { label: 'Zoom', value: 'zoom' },
              { label: 'None', value: 'none' },
            ]}
            value={settings.transition}
            onChange={(v) => updateSettings({ transition: v as any })}
          />
        </div>
      </Section>

      <Section title="Canvas">
        <Slider
          label="Padding"
          value={settings.padding}
          min={0}
          max={80}
          step={4}
          unit="px"
          onChange={(v) => updateSettings({ padding: v })}
        />
        <Slider
          label="Rounded"
          value={settings.borderRadius}
          min={0}
          max={48}
          step={2}
          unit="px"
          onChange={(v) => updateSettings({ borderRadius: v })}
        />
        <Slider
          label="Shadow"
          value={settings.shadow}
          min={0}
          max={40}
          step={1}
          onChange={(v) => updateSettings({ shadow: v })}
        />
      </Section>

      <Section title="Background">
        <SegmentedControl
          options={[
            { label: 'Color', value: 'color' },
            { label: 'Image', value: 'image' },
            { label: 'Slide', value: 'slide' },
          ]}
          value={settings.backgroundMode}
          onChange={(v) => updateSettings({ backgroundMode: v as any })}
        />
        
        {settings.backgroundMode === 'slide' && (
          <>
            <Slider
              label="Blur"
              value={settings.backgroundBlur}
              min={0}
              max={30}
              onChange={(v) => updateSettings({ backgroundBlur: v })}
            />
            <Slider
              label="Overlay"
              value={settings.backgroundOverlay}
              min={0}
              max={100}
              unit="%"
              onChange={(v) => updateSettings({ backgroundOverlay: v })}
            />
          </>
        )}
      </Section>

      <Section title="Layout">
        <div>
          <label className="text-[11px] font-medium uppercase tracking-[0.08em] text-[var(--color-text-muted)] block mb-2">
            Image Fit
          </label>
          <SegmentedControl
            options={[
              { label: 'Cover', value: 'cover' },
              { label: 'Contain', value: 'contain' },
            ]}
            value={settings.imageFit}
            onChange={(v) => updateSettings({ imageFit: v as any })}
          />
        </div>
      </Section>

      <Section title="Audio">
        {audio ? (
          <div className="bg-[var(--color-bg-panel)] border border-[var(--color-border-default)] rounded-[var(--radius-sm)] p-3">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-full bg-[var(--color-interactive)] flex items-center justify-center text-white">
                <SpeakerHigh size={16} weight="fill" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[12px] font-semibold truncate text-[var(--color-text-primary)]">
                  {audio.name}
                </div>
                <div className="text-[10px] text-[var(--color-text-muted)] font-medium">
                  Background Music
                </div>
              </div>
              <button 
                onClick={() => setAudio(null)}
                className="p-1.5 text-[var(--color-text-muted)] hover:text-red-500 transition-colors"
                title="Remove Audio"
              >
                <Trash size={14} />
              </button>
            </div>
            <audio src={audio.url} controls className="w-full h-8 scale-90 -mx-2 opacity-80" />
          </div>
        ) : (
          <div className="space-y-4">
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]">
                <MagnifyingGlass size={14} />
              </div>
              <input
                type="text"
                placeholder="Search tracks..."
                className="w-full h-9 pl-9 pr-3 bg-[var(--color-bg-surface)] border border-[var(--color-border-default)] rounded-[var(--radius-sm)] text-[12px] focus:outline-none focus:border-[var(--color-interactive)] placeholder:text-[var(--color-text-muted)]/50"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="max-h-[280px] overflow-y-auto space-y-1 pr-1 custom-scrollbar">
              {filteredTracks.map((track) => (
                <button
                  key={track.id}
                  onClick={() => setAudio({ url: track.url, name: track.name })}
                  className="w-full flex items-center gap-3 p-2 rounded-[var(--radius-sm)] hover:bg-[var(--color-bg-hover)] transition-colors text-left group"
                >
                  <div className="w-7 h-7 rounded-sm bg-[var(--color-bg-surface)] border border-[var(--color-border-default)] flex items-center justify-center text-[var(--color-text-muted)] group-hover:bg-[var(--color-interactive)] group-hover:text-white transition-colors">
                    <MusicNotes size={14} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[11px] font-semibold truncate text-[var(--color-text-primary)]">
                      {track.name}
                    </div>
                  </div>
                  <Plus size={12} className="text-[var(--color-text-muted)] opacity-0 group-hover:opacity-100" />
                </button>
              ))}
              {filteredTracks.length === 0 && (
                <div className="text-center py-6 text-[11px] text-[var(--color-text-muted)]">
                  No tracks found for "{searchQuery}"
                </div>
              )}
            </div>
          </div>
        )}
        <div className="mt-3 text-[10px] text-[var(--color-text-muted)] italic px-1 flex items-center gap-1.5 border-t border-[var(--color-border-default)] pt-3">
          <div className="w-1 h-1 rounded-full bg-[var(--color-interactive)]" />
          Tip: Select a track to add it to your project
        </div>
      </Section>
    </aside>
  );
};

export default ControlPanel;
