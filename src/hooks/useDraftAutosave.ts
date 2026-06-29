import { useEffect } from 'react';
import { useReecapStore } from '../store/reecapStore';
import { useMotionStore } from '../store/motionStore';
import { autosaveInto } from '../lib/drafts';

const DEBOUNCE_MS = 1500;

/**
 * Pro-only autosave: debounced snapshots of whichever tool is active roll into
 * the draft the user has open (so edits to an opened draft are kept in it), or
 * the tool's "Last session" draft for fresh work. Skipped for empty projects
 * and for free/guest users.
 */
export function useDraftAutosave() {
  const isPremium = useReecapStore((s) => s.isPremium);
  const activeView = useReecapStore((s) => s.activeView);
  const currentDraftId = useReecapStore((s) => s.currentDraftId);

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
    if (activeView === 'editor' && photos.length > 0) {
      const t = setTimeout(() => { autosaveInto('video', currentDraftId.video).catch(() => {}); }, DEBOUNCE_MS);
      return () => clearTimeout(t);
    }
    if (activeView === 'motion' && motionDoc.layers.length > 0) {
      const t = setTimeout(() => { autosaveInto('motion', currentDraftId.motion).catch(() => {}); }, DEBOUNCE_MS);
      return () => clearTimeout(t);
    }
  }, [isPremium, activeView, currentDraftId, photos, settings, projectName, audio, playbackSpeed, motionDoc]);
}
