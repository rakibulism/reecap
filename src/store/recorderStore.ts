import { create } from 'zustand';
import type { ClickMark, RecorderClip, ZoomSettings } from '../types/recorder';

const uid = () => Math.random().toString(36).slice(2, 10);

const DEFAULT_ZOOM: ZoomSettings = { enabled: true, level: 1.8, inDur: 0.5, hold: 1.2, outDur: 0.6 };

interface RecorderState {
  clip: RecorderClip | null;
  clicks: ClickMark[];
  zoom: ZoomSettings;
  isRecording: boolean;

  setClip: (clip: RecorderClip | null) => void;
  setClicks: (clicks: ClickMark[]) => void;
  addClick: (t: number, x: number, y: number) => void;
  toggleClick: (id: string) => void;
  removeClick: (id: string) => void;
  setZoom: (patch: Partial<ZoomSettings>) => void;
  setRecording: (v: boolean) => void;
  reset: () => void;
}

export const useRecorderStore = create<RecorderState>((set) => ({
  clip: null,
  clicks: [],
  zoom: DEFAULT_ZOOM,
  isRecording: false,

  setClip: (clip) => set({ clip }),
  setClicks: (clicks) => set({ clicks }),
  addClick: (t, x, y) => set((s) => ({ clicks: [...s.clicks, { id: uid(), t, x, y }].sort((a, b) => a.t - b.t) })),
  toggleClick: (id) => set((s) => ({ clicks: s.clicks.map((c) => (c.id === id ? { ...c, disabled: !c.disabled } : c)) })),
  removeClick: (id) => set((s) => ({ clicks: s.clicks.filter((c) => c.id !== id) })),
  setZoom: (patch) => set((s) => ({ zoom: { ...s.zoom, ...patch } })),
  setRecording: (v) => set({ isRecording: v }),
  reset: () => set({ clip: null, clicks: [], isRecording: false, zoom: DEFAULT_ZOOM }),
}));
