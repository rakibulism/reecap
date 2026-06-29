import React, { useEffect, useState } from 'react';
import { X, FloppyDisk, FilmSlate, MagicWand, PencilSimple, Trash, FolderOpen, Check, Plus } from 'phosphor-react';
import { useReecapStore } from '../../store/reecapStore';
import { useMotionStore } from '../../store/motionStore';
import {
  listDrafts,
  saveNamedDraft,
  openDraft,
  renameDraft,
  deleteDraft,
  type DraftMeta,
  type DraftTool,
} from '../../lib/drafts';

const TOOL_META: Record<DraftTool, { icon: React.ElementType; label: string }> = {
  video: { icon: FilmSlate, label: 'Video' },
  motion: { icon: MagicWand, label: 'Motion' },
};

function ago(ts: number): string {
  const s = Math.floor((Date.now() - ts) / 1000);
  if (s < 60) return 'just now';
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

const DraftsModal: React.FC = () => {
  const { draftsOpen, setDraftsOpen, activeView, setActiveView, currentDraftId, setCurrentDraftId } = useReecapStore();
  const [drafts, setDrafts] = useState<DraftMeta[]>([]);
  const [loading, setLoading] = useState(true);
  const [saveName, setSaveName] = useState('');
  const [busy, setBusy] = useState(false);
  const [renameId, setRenameId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');

  // Which tool's project can be saved right now.
  const currentTool: DraftTool | null =
    activeView === 'editor' ? 'video' : activeView === 'motion' ? 'motion' : null;

  const refresh = () => {
    setLoading(true);
    listDrafts().then((d) => { setDrafts(d); setLoading(false); }).catch(() => setLoading(false));
  };

  useEffect(() => { if (draftsOpen) refresh(); }, [draftsOpen]);

  if (!draftsOpen) return null;
  const close = () => setDraftsOpen(false);

  const doSave = async () => {
    if (!currentTool || busy) return;
    setBusy(true);
    try {
      const meta = await saveNamedDraft(currentTool, saveName || `${TOOL_META[currentTool].label} draft`);
      // Keep editing this newly-saved draft — further edits autosave into it.
      setCurrentDraftId(currentTool, meta.id);
      setSaveName('');
      refresh();
    } finally {
      setBusy(false);
    }
  };

  const doOpen = async (id: string) => {
    const tool = await openDraft(id);
    if (tool) {
      // From now on, edits in this tool autosave back into the opened draft.
      setCurrentDraftId(tool, id);
      setActiveView(tool === 'video' ? 'editor' : 'motion');
    }
    close();
  };

  // Start a fresh project — clears the editor and detaches from the current
  // draft, so the next edits create a new per-session draft.
  const newProject = () => {
    if (!currentTool) return;
    if (currentTool === 'video') {
      const st = useReecapStore.getState();
      st.loadVideoProject({ photos: [], settings: st.settings, projectName: '', playbackSpeed: 1, audio: null });
      setCurrentDraftId('video', null);
    } else {
      useMotionStore.getState().loadDoc({ width: 1920, height: 1080, duration: 4, background: '#111111', layers: [] });
      setCurrentDraftId('motion', null);
    }
    close();
  };

  const commitRename = async (id: string) => {
    await renameDraft(id, renameValue);
    setRenameId(null);
    refresh();
  };

  const doDelete = async (id: string) => {
    await deleteDraft(id);
    refresh();
  };

  return (
    <div className="fixed inset-0 z-[4000] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/45 backdrop-blur-sm animate-in fade-in" onClick={close} />
      <div className="relative w-full max-w-xl max-h-[85vh] flex flex-col rounded-[var(--radius-lg)] bg-[var(--color-bg-panel)] border border-[var(--color-border-default)] shadow-[var(--shadow-md)] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--color-border-default)]">
          <div>
            <h2 className="text-[16px] font-bold tracking-tight">Drafts</h2>
            <p className="text-[12px] text-[var(--color-text-muted)] mt-0.5">Saved in this browser. Open one to keep editing.</p>
          </div>
          <div className="flex items-center gap-2">
            {currentTool && (
              <button
                onClick={newProject}
                title={`Start a new ${TOOL_META[currentTool].label.toLowerCase()} project`}
                className="inline-flex items-center gap-1.5 h-9 px-3 rounded-[var(--radius-sm)] border border-[var(--color-border-default)] text-[12px] font-semibold hover:border-[var(--color-primary)]"
              >
                <Plus size={14} weight="bold" /> New {TOOL_META[currentTool].label.toLowerCase()}
              </button>
            )}
            <button onClick={close} className="p-1.5 rounded-[var(--radius-sm)] text-[var(--color-text-muted)] hover:bg-[var(--color-bg-hover)] hover:text-[var(--color-text-primary)]">
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Save current */}
        {currentTool && (
          <div className="flex items-center gap-2 px-5 py-3 border-b border-[var(--color-border-default)] bg-[var(--color-bg-surface)]">
            <input
              value={saveName}
              onChange={(e) => setSaveName(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') doSave(); }}
              placeholder={`Save current ${TOOL_META[currentTool].label.toLowerCase()} as…`}
              className="flex-1 h-9 px-3 rounded-[var(--radius-sm)] bg-[var(--color-bg-panel)] border border-[var(--color-border-default)] text-[13px] focus:outline-none focus:border-[var(--color-primary)]"
            />
            <button
              onClick={doSave}
              disabled={busy}
              className="shrink-0 inline-flex items-center gap-1.5 h-9 px-4 rounded-[var(--radius-sm)] bg-[var(--color-primary)] text-white text-[13px] font-semibold hover:opacity-90 disabled:opacity-50"
            >
              <FloppyDisk size={16} weight="fill" /> Save draft
            </button>
          </div>
        )}

        {/* List */}
        <div className="flex-1 overflow-y-auto p-3 custom-scrollbar">
          {loading ? (
            <p className="text-center text-[13px] text-[var(--color-text-muted)] py-10">Loading…</p>
          ) : drafts.length === 0 ? (
            <p className="text-center text-[13px] text-[var(--color-text-muted)] py-10">
              No drafts yet. Edit a video or motion project, then save it here.
            </p>
          ) : (
            <div className="space-y-2">
              {drafts.map((d) => {
                const TIcon = TOOL_META[d.tool].icon;
                return (
                  <div key={d.id} className="flex items-center gap-3 p-2.5 rounded-[var(--radius-md)] border border-[var(--color-border-default)] bg-[var(--color-bg-surface)] hover:border-[var(--color-text-muted)] transition-colors">
                    <div className="w-16 h-10 rounded-[var(--radius-sm)] overflow-hidden bg-[var(--color-bg-panel)] shrink-0 flex items-center justify-center">
                      {d.thumbnail ? (
                        <img src={d.thumbnail} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <TIcon size={18} className="text-[var(--color-text-muted)]" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      {renameId === d.id ? (
                        <input
                          autoFocus
                          value={renameValue}
                          onChange={(e) => setRenameValue(e.target.value)}
                          onKeyDown={(e) => { if (e.key === 'Enter') commitRename(d.id); if (e.key === 'Escape') setRenameId(null); }}
                          onBlur={() => commitRename(d.id)}
                          className="w-full h-7 px-2 rounded-[var(--radius-sm)] bg-[var(--color-bg-panel)] border border-[var(--color-primary)] text-[13px] focus:outline-none"
                        />
                      ) : (
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="text-[13px] font-semibold truncate">{d.name}</span>
                          {currentDraftId[d.tool] === d.id && (
                            <span className="shrink-0 text-[10px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded bg-[var(--color-primary)]/15 text-[var(--color-primary)]">Editing</span>
                          )}
                        </div>
                      )}
                      <div className="flex items-center gap-1.5 mt-0.5 text-[11px] text-[var(--color-text-muted)]">
                        <TIcon size={11} /> {TOOL_META[d.tool].label}
                        <span>·</span>
                        {d.kind === 'auto' ? <span className="text-[var(--color-primary)] font-semibold">Autosaved</span> : <span>Saved</span>}
                        <span>·</span>
                        {ago(d.updatedAt)}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button onClick={() => doOpen(d.id)} title="Open" className="inline-flex items-center gap-1.5 h-8 px-3 rounded-[var(--radius-sm)] bg-[var(--color-bg-panel)] border border-[var(--color-border-default)] text-[12px] font-semibold hover:border-[var(--color-primary)]">
                        <FolderOpen size={14} /> Open
                      </button>
                      {d.kind === 'named' && renameId !== d.id && (
                        <button onClick={() => { setRenameId(d.id); setRenameValue(d.name); }} title="Rename" className="w-8 h-8 flex items-center justify-center rounded-[var(--radius-sm)] text-[var(--color-text-muted)] hover:bg-[var(--color-bg-hover)] hover:text-[var(--color-text-primary)]">
                          <PencilSimple size={15} />
                        </button>
                      )}
                      {renameId === d.id && (
                        <button onClick={() => commitRename(d.id)} title="Save name" className="w-8 h-8 flex items-center justify-center rounded-[var(--radius-sm)] text-[var(--color-primary)] hover:bg-[var(--color-bg-hover)]">
                          <Check size={16} weight="bold" />
                        </button>
                      )}
                      <button onClick={() => doDelete(d.id)} title="Delete" className="w-8 h-8 flex items-center justify-center rounded-[var(--radius-sm)] text-[var(--color-text-muted)] hover:bg-red-500/10 hover:text-red-500">
                        <Trash size={15} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DraftsModal;
