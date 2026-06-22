import { create } from 'zustand';
import type {
  LayerType,
  MotionDoc,
  MotionLayer,
  ReecapMotionPayload,
} from '../types/motion';
import { defaultAnimation } from '../lib/motionEngine';

// Default composition: 1080p-ish design space, dark stage, 4 seconds.
const DEFAULT_DOC: MotionDoc = {
  width: 1920,
  height: 1080,
  duration: 4,
  background: '#111111',
  layers: [],
};

const uid = () => Math.random().toString(36).slice(2, 10);

let layerCounter = 0;
function layerName(type: LayerType): string {
  layerCounter += 1;
  const base = type.charAt(0).toUpperCase() + type.slice(1);
  return `${base} ${layerCounter}`;
}

// Per-type layer factory. New layers are centered in the composition.
function makeLayer(type: LayerType, doc: MotionDoc, patch: Partial<MotionLayer> = {}): MotionLayer {
  const width = patch.width ?? (type === 'text' ? 520 : 360);
  const height = patch.height ?? (type === 'text' ? 120 : 240);
  const base: MotionLayer = {
    id: uid(),
    type,
    name: layerName(type),
    x: patch.x ?? Math.round((doc.width - width) / 2),
    y: patch.y ?? Math.round((doc.height - height) / 2),
    width,
    height,
    rotation: 0,
    opacity: 1,
    fill: type === 'ellipse' ? '#FF3D03' : '#3B82F6',
    cornerRadius: type === 'rectangle' ? 16 : 0,
    visible: true,
    locked: false,
    animation: defaultAnimation(),
    ...patch,
  };
  if (type === 'text') {
    base.text = patch.text ?? 'Your text here';
    base.fontSize = patch.fontSize ?? 72;
    base.fontFamily = patch.fontFamily ?? 'Inter, system-ui, sans-serif';
    base.fontWeight = patch.fontWeight ?? 700;
    base.color = patch.color ?? '#FFFFFF';
    base.align = patch.align ?? 'center';
  }
  return base;
}

// Fit a source w×h box inside the composition, centered, at ~80% scale.
function fitIntoDoc(doc: MotionDoc, srcW: number, srcH: number) {
  const maxW = doc.width * 0.8;
  const maxH = doc.height * 0.8;
  const scale = Math.min(maxW / srcW, maxH / srcH, 1);
  const width = Math.round(srcW * scale);
  const height = Math.round(srcH * scale);
  return {
    width,
    height,
    x: Math.round((doc.width - width) / 2),
    y: Math.round((doc.height - height) / 2),
  };
}

interface MotionStore {
  doc: MotionDoc;
  selectedId: string | null;
  time: number;       // playhead position, seconds
  isPlaying: boolean;

  addLayer: (type: LayerType) => void;
  addImageLayer: (src: string, naturalW: number, naturalH: number, name?: string) => void;
  importPayload: (payload: ReecapMotionPayload) => void;
  updateLayer: (id: string, patch: Partial<MotionLayer>) => void;
  removeLayer: (id: string) => void;
  duplicateLayer: (id: string) => void;
  reorderLayer: (fromIndex: number, toIndex: number) => void;
  selectLayer: (id: string | null) => void;
  setTime: (t: number) => void;
  setPlaying: (v: boolean) => void;
  setDuration: (seconds: number) => void;
  setBackground: (color: string) => void;
}

export const useMotionStore = create<MotionStore>((set) => ({
  doc: DEFAULT_DOC,
  selectedId: null,
  time: 0,
  isPlaying: false,

  addLayer: (type) =>
    set((state) => {
      const layer = makeLayer(type, state.doc);
      return {
        doc: { ...state.doc, layers: [...state.doc.layers, layer] },
        selectedId: layer.id,
      };
    }),

  addImageLayer: (src, naturalW, naturalH, name) =>
    set((state) => {
      const box = fitIntoDoc(state.doc, naturalW || state.doc.width, naturalH || state.doc.height);
      const layer = makeLayer('image', state.doc, { ...box, src, name: name || layerName('image') });
      return {
        doc: { ...state.doc, layers: [...state.doc.layers, layer] },
        selectedId: layer.id,
      };
    }),

  importPayload: (payload) =>
    set((state) => {
      // Resize the composition to match the imported frame's aspect, then drop
      // the frame in as a full-bleed image layer.
      const doc: MotionDoc = {
        ...state.doc,
        width: payload.width || state.doc.width,
        height: payload.height || state.doc.height,
      };
      const layer = makeLayer('image', doc, {
        src: payload.image,
        name: payload.name || 'Figma Frame',
        x: 0,
        y: 0,
        width: doc.width,
        height: doc.height,
      });
      return {
        doc: { ...doc, layers: [...doc.layers, layer] },
        selectedId: layer.id,
      };
    }),

  updateLayer: (id, patch) =>
    set((state) => ({
      doc: {
        ...state.doc,
        layers: state.doc.layers.map((l) => (l.id === id ? { ...l, ...patch } : l)),
      },
    })),

  removeLayer: (id) =>
    set((state) => ({
      doc: { ...state.doc, layers: state.doc.layers.filter((l) => l.id !== id) },
      selectedId: state.selectedId === id ? null : state.selectedId,
    })),

  duplicateLayer: (id) =>
    set((state) => {
      const src = state.doc.layers.find((l) => l.id === id);
      if (!src) return state;
      const copy: MotionLayer = {
        ...src,
        id: uid(),
        name: `${src.name} copy`,
        x: src.x + 32,
        y: src.y + 32,
        animation: { ...src.animation },
      };
      const idx = state.doc.layers.findIndex((l) => l.id === id);
      const layers = [...state.doc.layers];
      layers.splice(idx + 1, 0, copy);
      return { doc: { ...state.doc, layers }, selectedId: copy.id };
    }),

  reorderLayer: (fromIndex, toIndex) =>
    set((state) => {
      const layers = [...state.doc.layers];
      const [moved] = layers.splice(fromIndex, 1);
      layers.splice(toIndex, 0, moved);
      return { doc: { ...state.doc, layers } };
    }),

  selectLayer: (id) => set({ selectedId: id }),
  setTime: (t) => set((state) => ({ time: Math.max(0, Math.min(state.doc.duration, t)) })),
  setPlaying: (v) => set({ isPlaying: v }),
  setDuration: (seconds) =>
    set((state) => ({
      doc: { ...state.doc, duration: Math.max(0.5, seconds) },
      time: Math.min(state.time, Math.max(0.5, seconds)),
    })),
  setBackground: (color) => set((state) => ({ doc: { ...state.doc, background: color } })),
}));
