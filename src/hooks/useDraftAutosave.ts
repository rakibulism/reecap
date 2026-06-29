import { useEffect } from 'react';
import { useReecapStore } from '../store/reecapStore';
import { useMotionStore } from '../store/motionStore';
import { updateAutosave } from '../lib/drafts';

const DEBOUNCE_MS = 1500;

/**
 * Pro-only autosave: debounced snapshots of whichever tool is active roll into
 * its "Last session" draft, so edits survive a reload. Skipped for empty
 * projects and for free/guest users.
 */
export function useDraftAutosave() {
  const isPremium = useReecapStore((s) => s.isPremium);
  const activeView = useReecapStore((s) => s.activeView);

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
      const t = setTimeout(() => { updateAutosave('video').catch(() => {}); }, DEBOUNCE_MS);
      return () => clearTimeout(t);
    }
    if (activeView === 'motion' && motionDoc.layers.length > 0) {
      const t = setTimeout(() => { updateAutosave('motion').catch(() => {}); }, DEBOUNCE_MS);
      return () => clearTimeout(t);
    }
  }, [isPremium, activeView, photos, settings, projectName, audio, playbackSpeed, motionDoc]);
}
