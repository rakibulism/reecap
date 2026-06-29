import { useEffect, useRef } from 'react';
import { useReecapStore } from '../store/reecapStore';
import { useMotionStore } from '../store/motionStore';
import { resumeLatest } from '../lib/drafts';

/**
 * Pro-only: on load, reopen the most-recent draft for each tool so the last
 * session stays open in the editor. Runs once, and only when the tool is empty
 * and not already tied to a draft (so it never clobbers in-progress work).
 */
export function useDraftResume() {
  const isPremium = useReecapStore((s) => s.isPremium);
  const setCurrentDraftId = useReecapStore((s) => s.setCurrentDraftId);
  const done = useRef(false);

  useEffect(() => {
    if (done.current || !isPremium) return;
    done.current = true;

    const s = useReecapStore.getState();
    if (s.photos.length === 0 && !s.currentDraftId.video) {
      resumeLatest('video').then((id) => { if (id) setCurrentDraftId('video', id); }).catch(() => {});
    }
    const m = useMotionStore.getState();
    if (m.doc.layers.length === 0 && !s.currentDraftId.motion) {
      resumeLatest('motion').then((id) => { if (id) setCurrentDraftId('motion', id); }).catch(() => {});
    }
  }, [isPremium, setCurrentDraftId]);
}
