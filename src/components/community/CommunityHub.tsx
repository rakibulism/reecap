import React, { useState, useMemo } from 'react';
import { useReecapStore } from '../../store/reecapStore';
import { 
  MagnifyingGlass, 
  MusicNotes, 
  Sparkle,
  PlayCircle,
  X,
  Plus
} from 'phosphor-react';
import { COMMUNITY_TEMPLATES, type CommunityTemplate } from '../../data/communityTemplates';
import { COMMUNITY_TRACKS } from '../../data/communityAudio';
import Button from '../ui/Button';

const CommunityHub: React.FC = () => {
  const { setActiveView, setAudio, addPhotos } = useReecapStore();
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'templates' | 'audio'>('all');
  const [previewTemplate, setPreviewTemplate] = useState<CommunityTemplate | null>(null);

  const allItems = useMemo(() => {
    const audioItems = COMMUNITY_TRACKS.map(track => ({
      id: track.id,
      title: track.name,
      type: 'audio' as const,
      category: 'audio' as const,
      audioUrl: track.url,
      preview: null
    }));
    return [...COMMUNITY_TEMPLATES, ...audioItems];
  }, []);

  const filteredItems = useMemo(() => {
    return allItems.filter(item => {
      const matchesSearch = item.title.toLowerCase().includes(search.toLowerCase());
      const matchesTab = activeTab === 'all' || item.category === activeTab;
      return matchesSearch && matchesTab;
    });
  }, [search, activeTab, allItems]);

  const handleSelectTemplate = (item: CommunityTemplate) => {
    const nextPhotos = item.images.map((url: string, index: number) => ({
      id: `temp-${item.id}-${index}-${Date.now()}`,
      objectUrl: url,
      name: `${item.title} ${index + 1}`,
      file: new File([], `${item.title} ${index + 1}`),
      width: 1920,
      height: 1080
    }));
    
    addPhotos(nextPhotos);
    setAudio({ url: item.audioUrl, name: item.title });
    setActiveView('editor');
    setPreviewTemplate(null);
  };

  const handleSelectAudio = (item: any) => {
    setAudio({ url: item.audioUrl, name: item.title });
    setActiveView('editor');
  };

  return (
    <div className="flex flex-col h-full bg-[var(--color-bg-page)] animate-in fade-in duration-500 relative">
      <div className="px-8 pt-8 pb-4">
        <h1 className="text-2xl font-bold mb-2">Community Hub</h1>
        <p className="text-[var(--color-text-secondary)] text-[14px]">Discover templates and sounds created by the community.</p>
      </div>

      <div className="flex items-center gap-4 px-8 py-4 border-b border-[var(--color-border-default)]">
        <div className="flex-1 relative">
          <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" size={18} />
          <input 
            type="text"
            placeholder="Search templates, music..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-10 pl-10 pr-4 bg-[var(--color-bg-panel)] border border-[var(--color-border-default)] rounded-[var(--radius-md)] text-[14px] focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          />
        </div>

        <div className="flex items-center bg-[var(--color-bg-panel)] p-1 rounded-[var(--radius-md)] border border-[var(--color-border-default)]">
          {(['all', 'templates', 'audio'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 h-8 text-[12px] font-bold rounded-[var(--radius-sm)] transition-all capitalize
                ${activeTab === tab 
                  ? 'bg-blue-500 text-white shadow-sm' 
                  : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'}`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredItems.map(item => (
            <div 
              key={item.id}
              className="group bg-[var(--color-bg-surface)] border border-[var(--color-border-default)] rounded-[var(--radius-lg)] overflow-hidden shadow-sm hover:shadow-md transition-all cursor-pointer"
              onClick={() => item.type === 'template' ? setPreviewTemplate(item as CommunityTemplate) : handleSelectAudio(item)}
            >
              <div className="aspect-video bg-[var(--color-bg-panel)] relative overflow-hidden">
                {item.preview ? (
                  <img src={item.preview} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-blue-500/30">
                    <MusicNotes size={48} weight="bold" />
                  </div>
                )}
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <PlayCircle size={48} className="text-white drop-shadow-md" weight="fill" />
                </div>
                <div className="absolute top-2 right-2">
                  <span className={`px-2 py-1 rounded-[var(--radius-sm)] text-[10px] font-bold uppercase tracking-wider backdrop-blur-md border border-white/20
                    ${item.type === 'template' ? 'bg-indigo-500/80 text-white' : 'bg-emerald-500/80 text-white'}`}>
                    {item.type}
                  </span>
                </div>
              </div>
              <div className="p-3">
                <h3 className="font-bold text-[14px] truncate">{item.title}</h3>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-[11px] text-[var(--color-text-muted)]">Premium</span>
                  <div className="flex items-center gap-1 text-blue-500">
                    <Sparkle size={12} weight="fill" />
                    <span className="text-[10px] font-bold">PRO</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Preview Modal */}
      {previewTemplate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-[var(--color-bg-page)] rounded-[var(--radius-lg)] shadow-2xl w-full max-w-4xl overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-4 border-b border-[var(--color-border-default)]">
              <h2 className="text-lg font-bold">Template Preview: {previewTemplate.title}</h2>
              <button onClick={() => setPreviewTemplate(null)} className="p-2 hover:bg-[var(--color-bg-hover)] rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div className="aspect-video rounded-[var(--radius-md)] overflow-hidden bg-[var(--color-bg-panel)] shadow-inner">
                    <img src={previewTemplate.preview} className="w-full h-full object-cover" alt="" />
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    {previewTemplate.images.map((img, i) => (
                      <div key={i} className="aspect-square rounded-[var(--radius-sm)] overflow-hidden border border-[var(--color-border-default)]">
                        <img src={img} className="w-full h-full object-cover" alt="" />
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="flex flex-col justify-between">
                  <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/10 text-indigo-500 rounded-full text-[12px] font-bold mb-4">
                      <Sparkle size={14} weight="fill" />
                      Community Template
                    </div>
                    <h3 className="text-3xl font-bold mb-2">{previewTemplate.title}</h3>
                    <p className="text-[var(--color-text-secondary)] mb-6 text-[15px] leading-relaxed">
                      A professional video recap template with curated motion settings and background music. 
                      Includes {previewTemplate.images.length} high-quality assets.
                    </p>
                    
                    <div className="space-y-4 mb-8">
                      <div className="flex items-center gap-3 p-3 bg-[var(--color-bg-panel)] rounded-[var(--radius-md)] border border-[var(--color-border-default)]">
                        <MusicNotes size={20} className="text-blue-500" weight="fill" />
                        <div>
                          <div className="text-[12px] font-bold">Background Music</div>
                          <div className="text-[11px] text-[var(--color-text-muted)] truncate">{previewTemplate.audioUrl.split('/').pop()}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-3 mt-auto pt-6 border-t border-[var(--color-border-default)]">
                    <Button variant="ghost" size="lg" className="flex-1" onClick={() => setPreviewTemplate(null)}>
                      Cancel
                    </Button>
                    <Button 
                      variant="primary" 
                      size="lg" 
                      className="flex-1" 
                      icon={<Plus size={18} weight="bold" />}
                      onClick={() => handleSelectTemplate(previewTemplate)}
                    >
                      Add to Video
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CommunityHub;
