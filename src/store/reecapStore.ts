import { create } from 'zustand';
import { type Photo, type ReecapSettings, type Theme } from '../types';
import {
  SAVE_MODE_KEY,
  NAME_PARTS_KEY,
  DEFAULT_NAME_PARTS,
  type VideoSaveMode,
  type NameParts,
} from '../lib/saveLocation';

interface ReecapStore {
  photos: Photo[];
  activeIndex: number;
  settings: ReecapSettings;
  projectName: string;
  videoSaveMode: VideoSaveMode;
  videoNameParts: NameParts;
  theme: Theme | 'system';
  playbackSpeed: number;
  showShortcuts: boolean;
  isPlaying: boolean;
  isExporting: boolean;
  exportProgress: number;
  playbackProgress: number;
  audio: { url: string; name: string } | null;
  activeView: 'editor' | 'community' | 'motion' | 'design' | 'recorder';
  activePanel: 'none' | 'assets' | 'music';
  isSidebarOpen: boolean;
  isPremium: boolean;
  premiumPromptOpen: boolean;
  draftsOpen: boolean;
  controlPanelOpen: boolean; // right settings panel in the video editor
  // Which saved draft the editor is currently working on, per tool. Edits
  // autosave back into it; null = a fresh project (a new draft is created).
  currentDraftId: { video: string | null; motion: string | null };
  // When set, the editor skips auto-resuming a draft for that tool once (used
  // when starting a brand-new project from the Home dashboard).
  skipResume: { video: boolean; motion: boolean };
  inviteCount: number;
  user: { plan: 'pro' | 'free'; name: string; avatar: string } | null;

  // Actions
  addPhotos: (newPhotos: Photo[]) => void;
  loadVideoProject: (project: {
    photos: Photo[];
    settings: ReecapSettings;
    projectName: string;
    playbackSpeed: number;
    audio: { url: string; name: string } | null;
  }) => void;
  setDraftsOpen: (v: boolean) => void;
  toggleControlPanel: () => void;
  setCurrentDraftId: (tool: 'video' | 'motion', id: string | null) => void;
  setSkipResume: (tool: 'video' | 'motion', v: boolean) => void;
  removePhoto: (id: string) => void;
  reorderPhotos: (startIndex: number, endIndex: number) => void;
  setActiveIndex: (index: number) => void;
  updatePhoto: (id: string, patch: Partial<Photo>) => void;
  updateSettings: (patch: Partial<ReecapSettings>) => void;
  setProjectName: (name: string) => void;
  setVideoSaveMode: (mode: VideoSaveMode) => void;
  setVideoNameParts: (patch: Partial<NameParts>) => void;
  setTheme: (theme: Theme | 'system') => void;
  setPlaying: (v: boolean) => void;
  setExporting: (v: boolean) => void;
  setExportProgress: (p: number) => void;
  setPlaybackSpeed: (speed: number) => void;
  setPlaybackProgress: (p: number | ((prev: number) => number)) => void;
  setShowShortcuts: (show: boolean) => void;
  setAudio: (audio: { url: string; name: string } | null) => void;
  toggleSidebar: () => void;
  setActiveView: (view: 'editor' | 'community' | 'motion' | 'design' | 'recorder') => void;
  setActivePanel: (panel: 'none' | 'assets' | 'music') => void;
  setSidebarOpen: (v: boolean) => void;
  setPremium: (v: boolean) => void;
  openPremiumPrompt: () => void;
  closePremiumPrompt: () => void;
  addInvite: () => void;
  login: (plan: 'pro' | 'free') => void;
  logout: () => void;
  subscribePremium: () => void;
  cancelPremium: () => void;
}

// Restore the saved file-name parts (aspect ratio / date / time), tolerating
// missing or corrupt storage.
function readNameParts(): NameParts {
  try {
    const raw = localStorage.getItem(NAME_PARTS_KEY);
    return raw ? { ...DEFAULT_NAME_PARTS, ...JSON.parse(raw) } : DEFAULT_NAME_PARTS;
  } catch {
    return DEFAULT_NAME_PARTS;
  }
}

type User = { plan: 'pro' | 'free'; name: string; avatar: string };
type Auth = { user: User | null; isPremium: boolean };

const AUTH_KEY = 'reecap-auth';

// Persist the signed-in user + plan so a reload keeps you logged in.
function readAuth(): Auth {
  try {
    const raw = localStorage.getItem(AUTH_KEY);
    if (!raw) return { user: null, isPremium: false };
    const p = JSON.parse(raw);
    return { user: p.user ?? null, isPremium: !!p.isPremium };
  } catch {
    return { user: null, isPremium: false };
  }
}

function persistAuth(auth: Auth): Auth {
  try {
    localStorage.setItem(AUTH_KEY, JSON.stringify(auth));
  } catch {
    /* storage unavailable */
  }
  return auth;
}

const AVATARS = {
  pro: 'https://avatars.githubusercontent.com/u/74898633?v=4',
  free: '/free-avatar.png',
} as const;

const savedAuth = readAuth();

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
  projectName: '',
  videoSaveMode: (localStorage.getItem(SAVE_MODE_KEY) as VideoSaveMode) || 'download',
  videoNameParts: readNameParts(),
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
  isPremium: savedAuth.isPremium,
  premiumPromptOpen: false,
  draftsOpen: false,
  controlPanelOpen: true,
  currentDraftId: { video: null, motion: null },
  skipResume: { video: false, motion: false },
  inviteCount: 0,
  user: savedAuth.user,

  addPhotos: (newPhotos) =>
    set((state) => ({
      photos: [...state.photos, ...newPhotos].slice(0, 30),
    })),

  loadVideoProject: (project) =>
    set((state) => {
      // Free the old session's object URLs before swapping in the draft's.
      state.photos.forEach((p) => {
        try { URL.revokeObjectURL(p.objectUrl); } catch { /* already gone */ }
        if (p.thumbnailUrl) { try { URL.revokeObjectURL(p.thumbnailUrl); } catch { /* noop */ } }
      });
      return {
        photos: project.photos,
        settings: project.settings,
        projectName: project.projectName,
        playbackSpeed: project.playbackSpeed,
        audio: project.audio,
        activeIndex: 0,
      };
    }),

  setDraftsOpen: (v) => set({ draftsOpen: v }),
  toggleControlPanel: () => set((s) => ({ controlPanelOpen: !s.controlPanelOpen })),
  setCurrentDraftId: (tool, id) =>
    set((state) => ({ currentDraftId: { ...state.currentDraftId, [tool]: id } })),
  setSkipResume: (tool, v) =>
    set((state) => ({ skipResume: { ...state.skipResume, [tool]: v } })),

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

  setProjectName: (name) => set({ projectName: name }),
  setVideoSaveMode: (mode) => {
    localStorage.setItem(SAVE_MODE_KEY, mode);
    set({ videoSaveMode: mode });
  },
  setVideoNameParts: (patch) =>
    set((state) => {
      const next = { ...state.videoNameParts, ...patch };
      localStorage.setItem(NAME_PARTS_KEY, JSON.stringify(next));
      return { videoNameParts: next };
    }),

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
  setPremium: (v) => set((state) => persistAuth({ user: state.user, isPremium: v })),
  openPremiumPrompt: () => set({ premiumPromptOpen: true, isSidebarOpen: false }),
  closePremiumPrompt: () => set({ premiumPromptOpen: false }),
  addInvite: () => set((state) => ({ inviteCount: state.inviteCount + 1 })),
  login: (plan) =>
    set(
      persistAuth({
        user: {
          plan,
          name: plan === 'pro' ? 'Pro Member' : 'Free User',
          avatar: AVATARS[plan],
        },
        isPremium: plan === 'pro',
      }),
    ),
  logout: () => set(persistAuth({ user: null, isPremium: false })),
  subscribePremium: () =>
    set((state) =>
      persistAuth({
        isPremium: true,
        user: state.user ? { ...state.user, plan: 'pro' } : state.user,
      }),
    ),
  cancelPremium: () =>
    set((state) =>
      persistAuth({
        isPremium: false,
        user: state.user ? { ...state.user, plan: 'free' } : state.user,
      }),
    ),
}));
