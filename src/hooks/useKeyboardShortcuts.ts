import { useEffect } from 'react';
import { useReecapStore } from '../store/reecapStore';
import { useExport } from './useExport';

export function useKeyboardShortcuts() {
  const { 
    isPlaying, setPlaying, 
    photos, activeIndex, setActiveIndex,
    theme, setTheme,
    setShowShortcuts,
    setActivePanel, setSidebarOpen, setActiveView
  } = useReecapStore();
  
  const { startExport } = useExport();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      const isMod = e.metaKey || e.ctrlKey;
      const isShift = e.shiftKey;

      // Space: Play/Pause
      if (e.code === 'Space') {
        const active = document.activeElement;
        if (active instanceof HTMLElement) active.blur();
        e.preventDefault();
        setPlaying(!isPlaying);
      }

      // ArrowLeft: Prev
      if (e.code === 'ArrowLeft') {
        if (photos.length > 0) {
          setActiveIndex((activeIndex - 1 + photos.length) % photos.length);
        }
      }

      // ArrowRight: Next
      if (e.code === 'ArrowRight') {
        if (photos.length > 0) {
          setActiveIndex((activeIndex + 1) % photos.length);
        }
      }

      // Shift + E: Export
      if (isShift && e.code === 'KeyE') {
        e.preventDefault();
        startExport();
      }

      // Shift + S: Switch Theme
      if (isShift && e.code === 'KeyS') {
        e.preventDefault();
        const themes: ('light' | 'dark' | 'system')[] = ['light', 'dark', 'system'];
        const currentIndex = themes.indexOf(theme);
        setTheme(themes[(currentIndex + 1) % themes.length]);
      }

      // Cmd + U: Upload (Trigger file picker)
      if (isMod && e.code === 'KeyU') {
        e.preventDefault();
        const input = document.querySelector('input[type="file"]') as HTMLInputElement;
        if (input) input.click();
      }

      // ? or / or Cmd+K: Show Shortcuts
      if (e.key === '?' || (isShift && e.code === 'Slash') || (isMod && e.code === 'KeyK')) {
        e.preventDefault();
        setShowShortcuts(true);
      }
      
      // Escape: Close all panels/modals
      if (e.code === 'Escape') {
        setActivePanel('none');
        setSidebarOpen(false);
        setShowShortcuts(false);
        setActiveView('editor');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, setPlaying, photos.length, activeIndex, setActiveIndex, theme, setTheme, startExport, setShowShortcuts, setActivePanel, setSidebarOpen, setActiveView]);
}
