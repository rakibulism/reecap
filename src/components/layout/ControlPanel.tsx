import React, { useState, useMemo } from 'react';
import { useReecapStore } from '../../store/reecapStore';
import Slider from '../ui/Slider';
import SegmentedControl from '../ui/SegmentedControl';
import { SpeakerHigh, Trash, MagnifyingGlass, MusicNotes, Plus } from 'phosphor-react';
import { COMMUNITY_TRACKS } from '../../data/communityAudio';
import { COMMUNITY_BACKGROUNDS, SUGGESTED_GRADIENTS } from '../../data/communityBackgrounds';

const ControlPanel: React.FC = () => {
  const { photos, activeIndex, settings, updateSettings, audio, setAudio, updatePhoto } = useReecapStore();
  const [searchQuery, setSearchQuery] = useState('');

  const activePhoto = photos[activeIndex];
  const activeTransition = activePhoto?.transition || settings.transition;

  const handleTransitionChange = (t: any) => {
    if (activePhoto) {
      updatePhoto(activePhoto.id, { transition: t });
    } else {
      updateSettings({ transition: t });
    }
  };

  const applyToAllTransitions = () => {
    photos.forEach(photo => {
      updatePhoto(photo.id, { transition: activeTransition });
    });
    updateSettings({ transition: activeTransition });
  };

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
          <div className="flex items-center justify-between mb-2">
            <label className="text-[11px] font-medium uppercase tracking-[0.08em] text-[var(--color-text-muted)] block">
              Transition {activePhoto ? `(Slide ${activeIndex + 1})` : ''}
            </label>
            {activePhoto && (
              <button 
                onClick={applyToAllTransitions}
                className="text-[9px] font-bold uppercase text-[var(--color-interactive)] hover:underline"
              >
                Apply to All
              </button>
            )}
          </div>
          <div className="grid grid-cols-4 gap-2">
            {[
              { label: 'Fade', value: 'fade' },
              { label: 'Slide', value: 'slide' },
              { label: 'Zoom', value: 'zoom' },
              { label: 'None', value: 'none' },
              { label: 'Slide Up', value: 'slide-up' },
              { label: 'Wipe', value: 'wipe' },
              { label: 'Flip', value: 'flip' },
              { label: 'Dissolve', value: 'dissolve' },
            ].map((opt) => (
              <button
                key={opt.value}
                onClick={() => handleTransitionChange(opt.value as any)}
                className={`h-8 rounded-[var(--radius-sm)] text-[10px] font-medium transition-all border
                  ${activeTransition === opt.value 
                    ? 'bg-[var(--color-interactive)] border-[var(--color-interactive)] text-white' 
                    : 'bg-[var(--color-bg-surface)] border-[var(--color-border-default)] text-[var(--color-text-muted)] hover:border-[var(--color-text-muted)]'}`}
              >
                {opt.label}
              </button>
            ))}
          </div>
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
        
        {settings.backgroundMode === 'color' && (
          <div className="space-y-4">
            <div>
              <label className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase mb-2 block">Custom Color/Gradient</label>
              <div className="flex flex-col gap-3">
                <div className="flex gap-2">
                  <div className="flex-1 flex flex-col gap-1">
                    <span className="text-[9px] text-[var(--color-text-muted)] uppercase">Start</span>
                    <div 
                      className="w-full h-8 bg-[var(--color-bg-surface)] border border-[var(--color-border-default)] rounded-[var(--radius-sm)] cursor-pointer p-1 group"
                      onClick={() => (document.getElementById('color-start') as HTMLInputElement)?.click()}
                    >
                      <div 
                        className="w-full h-full rounded-[2px]" 
                        style={{ background: settings.backgroundColor.includes('gradient') 
                          ? (settings.backgroundColor.match(/#[0-9a-fA-F]{6}/g)?.[0] || '#3B82F6')
                          : settings.backgroundColor 
                        }} 
                      />
                      <input 
                        id="color-start"
                        type="color" 
                        className="sr-only"
                        value={settings.backgroundColor.includes('gradient') 
                          ? (settings.backgroundColor.match(/#[0-9a-fA-F]{6}/g)?.[0] || '#3B82F6')
                          : settings.backgroundColor}
                        onChange={(e) => {
                          const nextColor = e.target.value;
                          if (settings.backgroundColor.includes('gradient')) {
                            const colors = settings.backgroundColor.match(/#[0-9a-fA-F]{6}/g) || ['#3B82F6', '#1D4ED8'];
                            updateSettings({ backgroundColor: `linear-gradient(135deg, ${nextColor}, ${colors[1] || colors[0]})` });
                          } else {
                            updateSettings({ backgroundColor: nextColor });
                          }
                        }}
                      />
                    </div>
                  </div>
                  <div className="flex-1 flex flex-col gap-1">
                    <span className="text-[9px] text-[var(--color-text-muted)] uppercase">End</span>
                    <div 
                      className="w-full h-8 bg-[var(--color-bg-surface)] border border-[var(--color-border-default)] rounded-[var(--radius-sm)] cursor-pointer p-1 group"
                      onClick={() => (document.getElementById('color-end') as HTMLInputElement)?.click()}
                    >
                      <div 
                        className="w-full h-full rounded-[2px]" 
                        style={{ background: settings.backgroundColor.includes('gradient') 
                          ? (settings.backgroundColor.match(/#[0-9a-fA-F]{6}/g)?.[1] || '#1D4ED8')
                          : settings.backgroundColor 
                        }} 
                      />
                      <input 
                        id="color-end"
                        type="color" 
                        className="sr-only"
                        value={settings.backgroundColor.includes('gradient') 
                          ? (settings.backgroundColor.match(/#[0-9a-fA-F]{6}/g)?.[1] || '#1D4ED8')
                          : settings.backgroundColor}
                        onChange={(e) => {
                          const nextColor = e.target.value;
                          const colors = settings.backgroundColor.match(/#[0-9a-fA-F]{6}/g) || [settings.backgroundColor, settings.backgroundColor];
                          updateSettings({ backgroundColor: `linear-gradient(135deg, ${colors[0]}, ${nextColor})` });
                        }}
                      />
                    </div>
                  </div>
                </div>
                <input 
                  type="text"
                  value={settings.backgroundColor}
                  onChange={(e) => updateSettings({ backgroundColor: e.target.value })}
                  className="w-full h-9 px-3 bg-[var(--color-bg-surface)] border border-[var(--color-border-default)] rounded-[var(--radius-sm)] text-[11px] tabular-nums"
                  placeholder="#000000 or gradient..."
                />
                <button 
                  onClick={() => {
                    if (settings.backgroundColor.includes('gradient')) {
                      const color = settings.backgroundColor.match(/#[0-9a-fA-F]{6}/g)?.[0] || '#3B82F6';
                      updateSettings({ backgroundColor: color });
                    } else {
                      updateSettings({ backgroundColor: `linear-gradient(135deg, ${settings.backgroundColor}, #000000)` });
                    }
                  }}
                  className="text-[10px] text-[var(--color-interactive)] hover:underline text-left"
                >
                  {settings.backgroundColor.includes('gradient') ? 'Switch to Solid' : 'Switch to Gradient'}
                </button>
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase mb-2 block">Suggested Gradients</label>
              <div className="grid grid-cols-3 gap-2">
                {SUGGESTED_GRADIENTS.map(g => (
                  <button
                    key={g.id}
                    className="aspect-square rounded-[var(--radius-sm)] border border-[var(--color-border-default)] overflow-hidden hover:scale-105 transition-transform"
                    style={{ background: g.gradient }}
                    onClick={() => updateSettings({ backgroundColor: g.gradient })}
                    title={g.name}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {settings.backgroundMode === 'image' && (
          <div className="space-y-4">
            <label className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase mb-2 block">Community Suggestions</label>
            <div className="grid grid-cols-2 gap-2 max-h-[200px] overflow-y-auto pr-1 custom-scrollbar">
              {COMMUNITY_BACKGROUNDS.map(bg => (
                <button
                  key={bg.id}
                  className={`aspect-video rounded-[var(--radius-sm)] border overflow-hidden transition-all
                    ${settings.backgroundColor === bg.url ? 'border-blue-500 ring-2 ring-blue-500/20' : 'border-[var(--color-border-default)] opacity-60 hover:opacity-100'}`}
                  onClick={() => updateSettings({ backgroundColor: bg.url })}
                >
                  <img src={bg.thumbnail} className="w-full h-full object-cover" alt={bg.name} />
                </button>
              ))}
            </div>
          </div>
        )}
        
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
