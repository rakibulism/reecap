import { create } from 'zustand';
import { type Photo, type ReecapSettings, type Theme } from '../types';

interface ReecapStore {
  photos: Photo[];
  activeIndex: number;
  settings: ReecapSettings;
  theme: Theme | 'system';
  playbackSpeed: number;
  showShortcuts: boolean;
  isPlaying: boolean;
  isExporting: boolean;
  exportProgress: number;
  playbackProgress: number;
  audio: { url: string; name: string } | null;
  activeView: 'editor' | 'community';
  activePanel: 'none' | 'assets' | 'music';
  isSidebarOpen: boolean;
  isPremium: boolean;
  inviteCount: number;

  // Actions
  addPhotos: (newPhotos: Photo[]) => void;
  removePhoto: (id: string) => void;
  reorderPhotos: (startIndex: number, endIndex: number) => void;
  setActiveIndex: (index: number) => void;
  updatePhoto: (id: string, patch: Partial<Photo>) => void;
  updateSettings: (patch: Partial<ReecapSettings>) => void;
  setTheme: (theme: Theme | 'system') => void;
  setPlaying: (v: boolean) => void;
  setExporting: (v: boolean) => void;
  setExportProgress: (p: number) => void;
  setPlaybackSpeed: (speed: number) => void;
  setPlaybackProgress: (p: number | ((prev: number) => number)) => void;
  setShowShortcuts: (show: boolean) => void;
  setAudio: (audio: { url: string; name: string } | null) => void;
  toggleSidebar: () => void;
  setActiveView: (view: 'editor' | 'community') => void;
  setActivePanel: (panel: 'none' | 'assets' | 'music') => void;
  setSidebarOpen: (v: boolean) => void;
  setPremium: (v: boolean) => void;
  addInvite: () => void;
}

export const useReecapStore = create<ReecapStore>((set) => ({
  photos: [],
  activeIndex: 0,
  settings: {
    duration: 1.5,
    transition: 'fade',
    aspectRatio: '16:9',
    padding: 24,
    borderRadius: 8,
    shadow: 0,
    backgroundMode: 'slide',
    backgroundColor: '#0A0A0A',
    backgroundBlur: 12,
    backgroundOverlay: 40,
    imageFit: 'contain',
    exportQuality: '2x',
  },
  theme: (localStorage.getItem('reecap-theme') as Theme | 'system') || 'system',
  playbackSpeed: 1,
  showShortcuts: false,
  isPlaying: false,
  isExporting: false,
  exportProgress: 0,
  playbackProgress: 0,
  audio: null,
  activeView: 'editor',
  activePanel: 'none',
  isSidebarOpen: false,
  isPremium: false,
  inviteCount: 0,

  addPhotos: (newPhotos) =>
    set((state) => ({
      photos: [...state.photos, ...newPhotos].slice(0, 30),
    })),

  removePhoto: (id) =>
    set((state) => {
      const photos = state.photos.filter((p) => p.id !== id);
      // Clean up object URLs
      const removed = state.photos.find((p) => p.id === id);
      if (removed) {
        URL.revokeObjectURL(removed.objectUrl);
        if (removed.thumbnailUrl) URL.revokeObjectURL(removed.thumbnailUrl);
      }

      return {
        photos,
        activeIndex: Math.min(state.activeIndex, Math.max(0, photos.length - 1)),
      };
    }),

  reorderPhotos: (startIndex, endIndex) =>
    set((state) => {
      const result = Array.from(state.photos);
      const [removed] = result.splice(startIndex, 1);
      result.splice(endIndex, 0, removed);
      return { photos: result };
    }),

  setActiveIndex: (index) => set({ activeIndex: index }),
  updatePhoto: (id, patch) =>
    set((state) => ({
      photos: state.photos.map((p) => (p.id === id ? { ...p, ...patch } : p)),
    })),

  updateSettings: (patch) =>
    set((state) => ({
      settings: { ...state.settings, ...patch },
    })),

  setTheme: (theme) => {
    localStorage.setItem('reecap-theme', theme);
    set({ theme });
  },

  setPlaying: (v) => set({ isPlaying: v }),
  setExporting: (v) => set({ isExporting: v }),
  setExportProgress: (p) => set({ exportProgress: p }),
  setPlaybackSpeed: (speed) => set({ playbackSpeed: speed }),
  setShowShortcuts: (show) => set({ showShortcuts: show }),
  setPlaybackProgress: (p) => 
    set((state) => ({ 
      playbackProgress: typeof p === 'function' ? p(state.playbackProgress) : p 
    })),
  setAudio: (audio) => set({ audio }),
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  setActiveView: (view) => set({ activeView: view }),
  setActivePanel: (panel) => set({ activePanel: panel }),
  setSidebarOpen: (v) => set({ isSidebarOpen: v }),
  setPremium: (v) => set({ isPremium: v }),
  addInvite: () => set((state) => ({ inviteCount: state.inviteCount + 1 })),
}));
