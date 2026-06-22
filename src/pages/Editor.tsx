import { useEffect } from 'react';
import { useReecapStore } from '../store/reecapStore';
import Topbar from '../components/layout/Topbar';
import Sidebar from '../components/layout/Sidebar';
import ControlPanel from '../components/layout/ControlPanel';
import Canvas from '../components/layout/Canvas';
import Timeline from '../components/layout/Timeline';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';
import { useAudioSync } from '../hooks/useAudioSync';
import MainSidebar from '../components/layout/MainSidebar';
import Community from '../components/community/Community';
import MediaShelf from '../components/layout/MediaShelf';
import ShortcutsModal from '../components/ui/ShortcutsModal';
import EditorMobileGate from '../components/layout/EditorMobileGate';
import MobileEditor from '../components/layout/MobileEditor';
import MotionDesigner from '../components/motion/MotionDesigner';
import DesignStudio from '../components/design/DesignStudio';
import { useIsMobile } from '../hooks/useIsMobile';
import { slideDuration } from '../lib/utils';

function Editor() {
  const {
    isPlaying, photos, activeIndex, setActiveIndex,
    settings, playbackSpeed, setPlaybackProgress,
    showShortcuts, setShowShortcuts,
    activeView, setActiveView,
  } = useReecapStore();

  const isMobile = useIsMobile();

  useKeyboardShortcuts();
  useAudioSync();

  useEffect(() => {
    let requestId: number;
    let lastTime: number;

    if (isPlaying && photos.length > 0) {
      lastTime = performance.now();

      const update = (time: number) => {
        const delta = (time - lastTime) / 1000;
        const totalSlideDuration = slideDuration(photos[activeIndex], settings) / playbackSpeed;

        setPlaybackProgress((prev) => {
          const next = prev + (delta / totalSlideDuration);
          if (next >= 1) {
            setActiveIndex((activeIndex + 1) % photos.length);
            return 0;
          }
          return next;
        });

        lastTime = time;
        requestId = requestAnimationFrame(update);
      };

      requestId = requestAnimationFrame(update);
    } else {
      setPlaybackProgress(0);
    }

    return () => cancelAnimationFrame(requestId);
  }, [isPlaying, photos.length, settings.duration, playbackSpeed, activeIndex, setActiveIndex, setPlaybackProgress]);

  return (
    <div className="flex flex-col h-screen bg-[var(--color-bg-page)] text-[var(--color-text-primary)] overflow-hidden font-sans">
      <MainSidebar />

      {isMobile ? (
        activeView === 'motion' || activeView === 'design' ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center px-8 gap-4">
            <span className="text-[12px] font-bold uppercase tracking-wider text-[var(--color-primary)]">
              {activeView === 'design' ? 'Design' : 'Motion Design'}
            </span>
            <h1 className="text-xl font-bold tracking-tight">Best on a bigger screen</h1>
            <p className="text-[var(--color-text-secondary)] leading-relaxed max-w-sm">
              {activeView === 'design'
                ? 'The Design tool is an infinite canvas with a toolbar, layers and inspector. Open Reecap on a desktop to design freely.'
                : 'The Motion Design tool needs a wider canvas, layers panel and timeline. Open Reecap on a desktop to animate your designs layer by layer.'}
            </p>
            <button
              onClick={() => setActiveView('editor')}
              className="h-11 px-6 rounded-[var(--radius-md)] bg-[var(--color-primary)] text-white font-semibold active:scale-95 transition-transform"
            >
              Back to Video Editor
            </button>
          </div>
        ) : (
          <MobileEditor />
        )
      ) : (
        <>
          <Topbar />

          {activeView === 'editor' ? (
            <>
              <div className="flex flex-1 overflow-hidden">
                <Sidebar />
                <MediaShelf />

                <div className="flex-1 flex flex-col overflow-hidden relative">
                  <Canvas />
                </div>

                <ControlPanel />
              </div>

              <Timeline />
            </>
          ) : activeView === 'motion' ? (
            <MotionDesigner />
          ) : activeView === 'design' ? (
            <DesignStudio />
          ) : (
            <Community />
          )}
        </>
      )}

      <ShortcutsModal
        isOpen={showShortcuts}
        onClose={() => setShowShortcuts(false)}
      />

      <EditorMobileGate />
    </div>
  );
}

export default Editor;
