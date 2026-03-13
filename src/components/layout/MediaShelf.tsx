import React from 'react';
import { useReecapStore } from '../../store/reecapStore';
import { MusicNotes, Plus, Trash, X, MagnifyingGlass, ImageSquare } from 'phosphor-react';
import { COMMUNITY_TRACKS } from '../../data/communityAudio';
import { COMMUNITY_ASSETS } from '../../data/communityAssets';
import { processFiles } from '../../lib/utils';

const MediaShelf: React.FC = () => {
  const { 
    activePanel, 
    setActivePanel, 
    photos, 
    addPhotos, 
    removePhoto,
    setAudio,
    audio
  } = useReecapStore();

  const [assetTab, setAssetTab] = React.useState<'uploads' | 'community'>('uploads');
  const [searchQuery, setSearchQuery] = React.useState('');

  if (activePanel === 'none') return null;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files).filter(f => 
      ['image/jpeg', 'image/png', 'image/webp'].includes(f.type)
    );
    const processed = await processFiles(files);
    addPhotos(processed);
  };

  const onDragStart = (e: React.DragEvent, item: any, type: 'image' | 'audio') => {
    e.dataTransfer.setData('type', type);
    e.dataTransfer.setData('itemId', item.id || item.url);
    if (type === 'image') {
      const url = item.objectUrl || item.url;
      e.dataTransfer.setData('itemUrl', url);
    } else {
      e.dataTransfer.setData('itemUrl', item.url);
      e.dataTransfer.setData('itemName', item.name);
    }
  };

  const filteredCommunityAssets = COMMUNITY_ASSETS.filter(asset => 
    asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    asset.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-72 bg-[var(--color-bg-panel)] border-r border-[var(--color-border-default)] flex flex-col animate-in slide-in-from-left duration-300 relative z-20 shadow-xl">
      <div className="flex items-center justify-between p-4 border-b border-[var(--color-border-default)]">
        <h3 className="text-sm font-bold uppercase tracking-wider text-[var(--color-text-primary)]">
          {activePanel === 'assets' ? 'Media Assets' : 'Music Library'}
        </h3>
        <button 
          onClick={() => setActivePanel('none')}
          className="p-1 hover:bg-[var(--color-bg-hover)] rounded-full transition-colors text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
        >
          <X size={18} />
        </button>
      </div>

      {activePanel === 'assets' && (
        <div className="px-4 py-2 border-b border-[var(--color-border-default)] flex gap-2">
          <button 
            onClick={() => setAssetTab('uploads')}
            className={`flex-1 py-1.5 text-[10px] font-bold uppercase tracking-tight rounded-[var(--radius-sm)] transition-all
              ${assetTab === 'uploads' ? 'bg-[var(--color-bg-hover)] text-[var(--color-text-primary)] shadow-sm' : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]'}`}
          >
            Uploads
          </button>
          <button 
            onClick={() => setAssetTab('community')}
            className={`flex-1 py-1.5 text-[10px] font-bold uppercase tracking-tight rounded-[var(--radius-sm)] transition-all
              ${assetTab === 'community' ? 'bg-[var(--color-bg-hover)] text-[var(--color-text-primary)] shadow-sm' : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]'}`}
          >
            Community
          </button>
        </div>
      )}

      {(activePanel === 'music' || (activePanel === 'assets' && assetTab === 'community')) && (
        <div className="p-3 border-b border-[var(--color-border-default)] bg-[var(--color-bg-surface)]/30">
          <div className="relative">
            <MagnifyingGlass size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
            <input 
              type="text" 
              placeholder={activePanel === 'assets' ? "Search photos..." : "Search music..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[var(--color-bg-panel)] border border-[var(--color-border-default)] rounded-[var(--radius-md)] py-1.5 pl-8 pr-3 text-[12px] focus:outline-none focus:ring-1 focus:ring-[var(--color-interactive)]/50 transition-all"
            />
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
        {activePanel === 'assets' ? (
          assetTab === 'uploads' ? (
            <div className="space-y-4">
              <label className="group flex flex-col items-center justify-center aspect-video rounded-[var(--radius-md)] border-2 border-dashed border-[var(--color-border-default)] hover:border-[var(--color-interactive)] transition-all cursor-pointer bg-[var(--color-bg-surface)]">
                <input type="file" multiple accept="image/*" className="hidden" onChange={handleFileUpload} />
                <Plus size={24} className="text-[var(--color-text-muted)] group-hover:text-[var(--color-interactive)] mb-2" />
                <span className="text-[11px] font-bold text-[var(--color-text-muted)] uppercase">Upload Assets</span>
              </label>

              <div className="grid grid-cols-2 gap-3">
                {photos.map((photo) => (
                  <div 
                    key={photo.id}
                    draggable
                    onDragStart={(e) => onDragStart(e, photo, 'image')}
                    className="group relative aspect-square rounded-[var(--radius-sm)] border border-[var(--color-border-default)] overflow-hidden bg-[var(--color-bg-surface)] cursor-grab active:cursor-grabbing"
                  >
                    <img src={photo.thumbnailUrl || photo.objectUrl} className="w-full h-full object-cover" alt="" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                      <button 
                        onClick={() => removePhoto(photo.id)}
                        className="p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                      >
                        <Trash size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              {photos.length === 0 && (
                <p className="text-center py-8 text-[11px] text-[var(--color-text-muted)] italic">No assets uploaded yet.</p>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {filteredCommunityAssets.map((asset) => (
                <div 
                  key={asset.id}
                  draggable
                  onDragStart={(e) => onDragStart(e, asset, 'image')}
                  className="group relative aspect-square rounded-[var(--radius-sm)] border border-[var(--color-border-default)] overflow-hidden bg-[var(--color-bg-surface)] cursor-grab active:cursor-grabbing hover:border-[var(--color-interactive)] transition-all shadow-sm hover:shadow-md"
                >
                  <img src={asset.thumbnail} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt={asset.name} />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
                    <span className="text-[9px] text-white font-bold truncate w-full">{asset.name}</span>
                  </div>
                  <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="bg-[var(--color-interactive)] p-1 rounded-full shadow-lg">
                      <Plus size={10} className="text-white" weight="bold" />
                    </div>
                  </div>
                </div>
              ))}
              {filteredCommunityAssets.length === 0 && (
                <div className="col-span-2 py-12 flex flex-col items-center justify-center text-[var(--color-text-muted)] gap-3 opacity-60">
                  <ImageSquare size={32} weight="thin" />
                  <p className="text-[11px] italic">No images found for "{searchQuery}"</p>
                </div>
              )}
            </div>
          )
        ) : (
          <div className="space-y-2">
            {COMMUNITY_TRACKS.filter(t => t.name.toLowerCase().includes(searchQuery.toLowerCase())).map((track) => {
              const isActive = audio?.url === track.url;
              return (
                <div 
                  key={track.id}
                  draggable
                  onDragStart={(e) => onDragStart(e, track, 'audio')}
                  className={`flex items-center gap-3 p-3 rounded-[var(--radius-md)] border transition-all cursor-grab active:cursor-grabbing
                    ${isActive 
                      ? 'bg-blue-500/10 border-blue-500/50' 
                      : 'bg-[var(--color-bg-surface)] border-[var(--color-border-default)] hover:border-[var(--color-interactive)]'}`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center
                    ${isActive ? 'bg-blue-500 text-white' : 'bg-[var(--color-bg-panel)] text-[var(--color-text-muted)]'}`}>
                    <MusicNotes size={16} weight={isActive ? 'fill' : 'regular'} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[11px] font-bold truncate text-[var(--color-text-primary)]">{track.name}</div>
                    <div className="text-[9px] text-[var(--color-text-muted)] flex gap-1">
                      {track.tags.slice(0, 2).map(tag => (
                        <span key={tag}>#{tag}</span>
                      ))}
                    </div>
                  </div>
                  <button 
                    onClick={() => setAudio(isActive ? null : { url: track.url, name: track.name })}
                    className={`p-1.5 rounded-full transition-colors ${isActive ? 'text-blue-500' : 'text-[var(--color-text-muted)] hover:text-[var(--color-interactive)]'}`}
                  >
                    <Plus size={14} weight="bold" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="p-3 bg-[var(--color-bg-panel)] border-t border-[var(--color-border-default)]">
        <p className="text-[9px] text-center text-[var(--color-text-muted)] uppercase font-bold tracking-tighter">
          Tip: Drag items onto the canvas
        </p>
      </div>
    </div>
  );
};

export default MediaShelf;
