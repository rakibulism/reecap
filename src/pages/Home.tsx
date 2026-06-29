import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FilmSlate, MagicWand, PenNib, Record, Plus, FolderOpen, Trash } from 'phosphor-react';
import SiteLayout from '../components/site/SiteLayout';
import { useSeo } from '../lib/seo';
import { useReecapStore } from '../store/reecapStore';
import { useMotionStore } from '../store/motionStore';
import { listDrafts, openDraft, deleteDraft, type DraftMeta, type DraftTool } from '../lib/drafts';

type ToolKey = 'video' | 'motion' | 'design' | 'recorder';

const TOOLS: { key: ToolKey; label: string; icon: React.ElementType; blurb: string; path: string; tint: string }[] = [
  { key: 'video', label: 'Video', icon: FilmSlate, blurb: 'Photo-to-MP4 recap', path: '/app', tint: 'text-[var(--color-primary)] bg-[var(--color-primary)]/10' },
  { key: 'motion', label: 'Motion', icon: MagicWand, blurb: 'Animate layer by layer', path: '/app/motion', tint: 'text-violet-500 bg-violet-500/10' },
  { key: 'design', label: 'Design', icon: PenNib, blurb: 'Infinite-canvas design', path: '/app/design', tint: 'text-amber-500 bg-amber-500/10' },
  { key: 'recorder', label: 'Recording', icon: Record, blurb: 'Screen + click-zoom', path: '/app/record', tint: 'text-rose-500 bg-rose-500/10' },
];

function ago(ts: number): string {
  const s = Math.floor((Date.now() - ts) / 1000);
  if (s < 60) return 'just now';
  const m = Math.floor(s / 60); if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60); if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

const Home: React.FC = () => {
  useSeo({
    title: 'Home — Your files | Reecap',
    description: 'Your Reecap files in one place — video recaps, motion projects, designs and recordings. Open a saved draft or start something new.',
    path: '/home',
    keywords: ['reecap home', 'reecap files', 'my projects', 'video drafts'],
  });

  const navigate = useNavigate();
  const isPremium = useReecapStore((s) => s.isPremium);
  const [drafts, setDrafts] = useState<DraftMeta[]>([]);
  const [filter, setFilter] = useState<'all' | DraftTool>('all');
  const [loading, setLoading] = useState(true);

  const refresh = () => {
    setLoading(true);
    listDrafts().then((d) => { setDrafts(d); setLoading(false); }).catch(() => setLoading(false));
  };
  useEffect(() => {
    let alive = true;
    listDrafts().then((d) => { if (alive) { setDrafts(d); setLoading(false); } }).catch(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, []);

  // Start a brand-new project, bypassing auto-resume so the editor opens fresh.
  const startNew = (key: ToolKey) => {
    const st = useReecapStore.getState();
    if (key === 'video') {
      st.loadVideoProject({ photos: [], settings: st.settings, projectName: '', playbackSpeed: 1, audio: null });
      st.setCurrentDraftId('video', null);
      st.setSkipResume('video', true);
      navigate('/app');
    } else if (key === 'motion') {
      useMotionStore.getState().loadDoc({ width: 1920, height: 1080, duration: 4, background: '#111111', layers: [] });
      st.setCurrentDraftId('motion', null);
      st.setSkipResume('motion', true);
      navigate('/app/motion');
    } else {
      navigate(key === 'design' ? '/app/design' : '/app/record');
    }
  };

  const openFile = async (id: string) => {
    const tool = await openDraft(id);
    if (!tool) return;
    useReecapStore.getState().setCurrentDraftId(tool, id);
    navigate(tool === 'video' ? '/app' : '/app/motion');
  };

  const removeFile = async (id: string) => { await deleteDraft(id); refresh(); };

  const shown = filter === 'all' ? drafts : drafts.filter((d) => d.tool === filter);

  return (
    <SiteLayout>
      <div className="max-w-5xl mx-auto px-5 sm:px-6 py-12 sm:py-16">
        <header className="mb-8">
          <p className="text-[13px] font-semibold uppercase tracking-[0.1em] text-[var(--color-primary)] mb-2">Home</p>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">Your files</h1>
          <p className="mt-3 text-[var(--color-text-secondary)] max-w-2xl">
            Start something new, or pick up a saved draft. Files are kept in this browser.
          </p>
        </header>

        {/* Create new */}
        <h2 className="text-[13px] font-bold uppercase tracking-wider text-[var(--color-text-muted)] mb-3">Create new</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-12">
          {TOOLS.map((t) => (
            <button
              key={t.key}
              onClick={() => startNew(t.key)}
              className="group text-left p-4 rounded-[var(--radius-lg)] border border-[var(--color-border-default)] bg-[var(--color-bg-surface)] hover:border-[var(--color-primary)]/50 hover:shadow-[var(--shadow-sm)] transition-all"
            >
              <span className={`inline-flex w-10 h-10 rounded-[var(--radius-md)] items-center justify-center mb-3 ${t.tint}`}>
                <t.icon size={22} weight="duotone" />
              </span>
              <div className="flex items-center gap-1.5 text-[15px] font-bold">
                <Plus size={14} weight="bold" className="text-[var(--color-text-muted)] group-hover:text-[var(--color-primary)]" /> {t.label}
              </div>
              <p className="text-[12px] text-[var(--color-text-muted)] mt-0.5">{t.blurb}</p>
            </button>
          ))}
        </div>

        {/* Files */}
        <div className="flex items-center justify-between mb-3 gap-3 flex-wrap">
          <h2 className="text-[13px] font-bold uppercase tracking-wider text-[var(--color-text-muted)]">Recent files</h2>
          <div className="flex items-center gap-1 p-1 rounded-[var(--radius-md)] bg-[var(--color-bg-panel)] border border-[var(--color-border-default)]">
            {(['all', 'video', 'motion'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 h-7 text-[12px] font-semibold rounded-[var(--radius-sm)] capitalize transition-all
                  ${filter === f ? 'bg-[var(--color-bg-surface)] text-[var(--color-text-primary)] shadow-sm' : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]'}`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <p className="text-[14px] text-[var(--color-text-muted)] py-10 text-center">Loading…</p>
        ) : shown.length === 0 ? (
          <div className="rounded-[var(--radius-lg)] border border-dashed border-[var(--color-border-default)] py-12 text-center">
            <p className="text-[14px] text-[var(--color-text-secondary)] font-semibold">No saved files yet</p>
            <p className="text-[13px] text-[var(--color-text-muted)] mt-1">
              {isPremium ? 'Create a Video or Motion project — it autosaves here as you edit.' : 'Saving drafts is a Pro feature. Create a project to get started.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {shown.map((d) => {
              const meta = TOOLS.find((t) => t.key === d.tool);
              const Icon = meta?.icon ?? FilmSlate;
              return (
                <div key={d.id} className="group rounded-[var(--radius-lg)] border border-[var(--color-border-default)] bg-[var(--color-bg-surface)] overflow-hidden hover:border-[var(--color-primary)]/40 transition-colors">
                  <button onClick={() => openFile(d.id)} className="block w-full aspect-video bg-[var(--color-bg-panel)] relative">
                    {d.thumbnail ? (
                      <img src={d.thumbnail} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <span className="absolute inset-0 flex items-center justify-center text-[var(--color-text-muted)]"><Icon size={28} /></span>
                    )}
                  </button>
                  <div className="p-3 flex items-center gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="text-[13px] font-semibold truncate">{d.name}</div>
                      <div className="flex items-center gap-1.5 mt-0.5 text-[11px] text-[var(--color-text-muted)] capitalize">
                        <Icon size={11} /> {d.tool} · {d.kind === 'auto' ? 'Autosaved' : 'Saved'} · {ago(d.updatedAt)}
                      </div>
                    </div>
                    <button onClick={() => openFile(d.id)} title="Open" className="shrink-0 inline-flex items-center gap-1 h-8 px-3 rounded-[var(--radius-sm)] bg-[var(--color-bg-panel)] border border-[var(--color-border-default)] text-[12px] font-semibold hover:border-[var(--color-primary)]">
                      <FolderOpen size={14} /> Open
                    </button>
                    <button onClick={() => removeFile(d.id)} title="Delete" className="shrink-0 w-8 h-8 flex items-center justify-center rounded-[var(--radius-sm)] text-[var(--color-text-muted)] hover:bg-red-500/10 hover:text-red-500">
                      <Trash size={15} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </SiteLayout>
  );
};

export default Home;
