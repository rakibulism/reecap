import { useEffect } from 'react';
import { useReecapStore } from '../store/reecapStore';
import { useMotionStore } from '../store/motionStore';
import { autosaveSession } from '../lib/drafts';

const DEBOUNCE_MS = 1500;

/**
 * Pro-only autosave: debounced snapshots of whichever tool is active are kept
 * as a draft. The first edit of a fresh project creates a new per-session
 * draft (so each session is its own draft); further edits update it. Skipped
 * for empty projects and for free/guest users.
 */
export function useDraftAutosave() {
  const isPremium = useReecapStore((s) => s.isPremium);
  const activeView = useReecapStore((s) => s.activeView);
  const currentDraftId = useReecapStore((s) => s.currentDraftId);
  const setCurrentDraftId = useReecapStore((s) => s.setCurrentDraftId);

  // Video slices that should trigger a re-save.
  const photos = useReecapStore((s) => s.photos);
  const settings = useReecapStore((s) => s.settings);
  const projectName = useReecapStore((s) => s.projectName);
  const audio = useReecapStore((s) => s.audio);
  const playbackSpeed = useReecapStore((s) => s.playbackSpeed);
  // Motion doc.
  const motionDoc = useMotionStore((s) => s.doc);

  useEffect(() => {
    if (!isPremium) return;
    const save = async (tool: 'video' | 'motion', current: string | null) => {
      const id = await autosaveSession(tool, current).catch(() => null);
      if (id && id !== current) setCurrentDraftId(tool, id);
    };
    if (activeView === 'editor' && photos.length > 0) {
      const t = setTimeout(() => { save('video', currentDraftId.video); }, DEBOUNCE_MS);
      return () => clearTimeout(t);
    }
    if (activeView === 'motion' && motionDoc.layers.length > 0) {
      const t = setTimeout(() => { save('motion', currentDraftId.motion); }, DEBOUNCE_MS);
      return () => clearTimeout(t);
    }
  }, [isPremium, activeView, currentDraftId, setCurrentDraftId, photos, settings, projectName, audio, playbackSpeed, motionDoc]);
}
