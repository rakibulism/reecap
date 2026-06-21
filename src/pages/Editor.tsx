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
import CommunityHub from '../components/community/CommunityHub';
import MediaShelf from '../components/layout/MediaShelf';
import ShortcutsModal from '../components/ui/ShortcutsModal';
import EditorMobileGate from '../components/layout/EditorMobileGate';
import MobileEditor from '../components/layout/MobileEditor';
import { useIsMobile } from '../hooks/useIsMobile';
import { slideDuration } from '../lib/utils';

function Editor() {
  const {
    isPlaying, photos, activeIndex, setActiveIndex,
    settings, playbackSpeed, setPlaybackProgress,
    showShortcuts, setShowShortcuts,
    activeView,
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
        <MobileEditor />
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
          ) : (
            <CommunityHub />
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
