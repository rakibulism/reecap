import { useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useReecapStore } from '../store/reecapStore';

type View = 'editor' | 'community' | 'motion' | 'design' | 'recorder';

// URL segment under /app  ⇄  activeView. The video editor is the default
// (bare /app); each other tool gets its own path.
const PATH_TO_VIEW: Record<string, View> = {
  '': 'editor',
  motion: 'motion',
  design: 'design',
  record: 'recorder',
  community: 'community',
};
const VIEW_TO_PATH: Record<View, string> = {
  editor: '',
  motion: 'motion',
  design: 'design',
  recorder: 'record',
  community: 'community',
};

const toPath = (view: View) => {
  const seg = VIEW_TO_PATH[view];
  return seg ? `/app/${seg}` : '/app';
};

/**
 * Keeps the URL and the store's `activeView` in sync, both directions:
 *   • deep link / refresh / back-forward  → set the matching view
 *   • tab switch (anything calling setActiveView) → push the matching URL
 *
 * A single optional-param route (`/app/:tool?`) backs all tools, so switching
 * never remounts the editor. Change-detection refs decide which side moved,
 * which both avoids a feedback loop and lets the URL win on first load.
 */
export function useViewRouting() {
  const { tool } = useParams();
  const navigate = useNavigate();
  const { activeView, setActiveView } = useReecapStore();

  const prevView = useRef(activeView);
  const prevTool = useRef(tool);
  const didInit = useRef(false);

  useEffect(() => {
    const seg = tool ?? '';
    const currentPath = seg ? `/app/${seg}` : '/app';
    const urlView = PATH_TO_VIEW[seg] ?? 'editor';

    if (!didInit.current) {
      // First load: the URL is authoritative. The recorder extension still
      // opens /app?recorder=1 after a capture — honour that legacy deep link.
      didInit.current = true;
      const fromRecorderQuery =
        seg === '' && new URLSearchParams(window.location.search).get('recorder') === '1';
      const initialView: View = fromRecorderQuery ? 'recorder' : urlView;
      if (initialView !== activeView) setActiveView(initialView);
      else if (toPath(activeView) !== currentPath) navigate(toPath(activeView), { replace: true });
    } else if (activeView !== prevView.current) {
      // The view changed (tab click / programmatic) → reflect it in the URL.
      if (toPath(activeView) !== currentPath) navigate(toPath(activeView));
    } else if (seg !== (prevTool.current ?? '')) {
      // The URL changed (back/forward / link) → reflect it in the view.
      if (urlView !== activeView) setActiveView(urlView);
    }

    prevView.current = activeView;
    prevTool.current = tool;
  }, [activeView, tool, navigate, setActiveView]);
}
