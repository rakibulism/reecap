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
  const base = type === 'group' ? 'Group' : type.charAt(0).toUpperCase() + type.slice(1);
  return `${base} ${layerCounter}`;
}

// Per-type layer factory. New layers are centered in the composition.
function makeLayer(type: LayerType, doc: MotionDoc, patch: Partial<MotionLayer> = {}): MotionLayer {
  const width = patch.width ?? (type === 'text' ? 520 : 360);
  const height = patch.height ?? (type === 'text' ? 120 : 240);
  const base: MotionLayer = {
    id: uid(),
    type,
    name: patch.name ?? layerName(type),
    x: patch.x ?? Math.round((doc.width - width) / 2),
    y: patch.y ?? Math.round((doc.height - height) / 2),
    width,
    height,
    rotation: 0,
    opacity: 1,
    fill: type === 'group' ? '' : type === 'ellipse' ? '#FF3D03' : '#3B82F6',
    cornerRadius: type === 'rectangle' ? 16 : 0,
    parentId: patch.parentId ?? null,
    visible: true,
    locked: false,
    animation: defaultAnimation(doc.duration),
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

// Indices (in paint order) of the layers that share a layer's parent.
function siblingIndices(layers: MotionLayer[], id: string): { idx: number; siblings: number[] } {
  const idx = layers.findIndex((l) => l.id === id);
  if (idx < 0) return { idx, siblings: [] };
  const parentId = layers[idx].parentId ?? null;
  const siblings = layers.map((l, i) => ({ l, i })).filter(({ l }) => (l.parentId ?? null) === parentId).map(({ i }) => i);
  return { idx, siblings };
}

function moveWithin(layers: MotionLayer[], from: number, to: number): MotionLayer[] {
  const next = [...layers];
  const [moved] = next.splice(from, 1);
  next.splice(to, 0, moved);
  return next;
}

// Collect a layer plus all of its (transitive) descendants by parentId.
function withDescendants(layers: MotionLayer[], id: string): Set<string> {
  const out = new Set<string>([id]);
  let added = true;
  while (added) {
    added = false;
    for (const l of layers) {
      if (l.parentId && out.has(l.parentId) && !out.has(l.id)) {
        out.add(l.id);
        added = true;
      }
    }
  }
  return out;
}

const SNAP = 0.05;
const MIN_SPAN = 0.2;
const snap = (s: number) => Math.round(s / SNAP) * SNAP;

interface MotionStore {
  doc: MotionDoc;
  selectedId: string | null;     // primary selection (drives the inspector)
  selectedIds: string[];         // full multi-selection
  time: number;                  // playhead position, seconds
  isPlaying: boolean;
  timelineHeight: number;        // px
  timelineZoom: number | null;   // px-per-second; null = fit-to-width

  addLayer: (type: LayerType) => void;
  addImageLayer: (src: string, naturalW: number, naturalH: number, name?: string) => void;
  importPayload: (payload: ReecapMotionPayload) => void;
  loadDoc: (doc: MotionDoc) => void;
  updateLayer: (id: string, patch: Partial<MotionLayer>) => void;
  setLayerPositions: (positions: { id: string; x: number; y: number }[]) => void;
  removeLayer: (id: string) => void;
  duplicateLayer: (id: string) => void;
  reorderLayer: (fromIndex: number, toIndex: number) => void;

  // Selection
  selectLayer: (id: string | null, additive?: boolean) => void;
  selectMany: (ids: string[]) => void;

  // Z-order (within same-parent siblings)
  bringForward: (id: string) => void;
  sendBackward: (id: string) => void;
  bringToFront: (id: string) => void;
  sendToBack: (id: string) => void;

  // Grouping
  groupSelection: () => void;
  ungroup: (groupId: string) => void;

  // Timeline
  setLayerSpan: (id: string, start: number, end: number) => void;
  setTime: (t: number) => void;
  setPlaying: (v: boolean) => void;
  setDuration: (seconds: number) => void;
  autoFitDuration: () => void;
  setBackground: (color: string) => void;
  setTimelineHeight: (h: number) => void;
  setTimelineZoom: (z: number | null) => void;
}

export const useMotionStore = create<MotionStore>((set) => ({
  doc: DEFAULT_DOC,
  selectedId: null,
  selectedIds: [],
  time: 0,
  isPlaying: false,
  timelineHeight: 240,
  timelineZoom: null,

  addLayer: (type) =>
    set((state) => {
      const layer = makeLayer(type, state.doc);
      return {
        doc: { ...state.doc, layers: [...state.doc.layers, layer] },
        selectedId: layer.id,
        selectedIds: [layer.id],
      };
    }),

  addImageLayer: (src, naturalW, naturalH, name) =>
    set((state) => {
      const box = fitIntoDoc(state.doc, naturalW || state.doc.width, naturalH || state.doc.height);
      const layer = makeLayer('image', state.doc, { ...box, src, name: name || layerName('image') });
      return {
        doc: { ...state.doc, layers: [...state.doc.layers, layer] },
        selectedId: layer.id,
        selectedIds: [layer.id],
      };
    }),

  importPayload: (payload) =>
    set((state) => {
      const doc: MotionDoc = {
        ...state.doc,
        width: payload.width || state.doc.width,
        height: payload.height || state.doc.height,
      };

      // v2 — reconstruct the editable layer tree.
      if (payload.layers && payload.layers.length) {
        // The frame should land looking exactly like Figma — static and fully
        // visible. Give every imported layer a no-animation clip so it shows at
        // the playhead; the user adds animations afterwards.
        if (payload.background) doc.background = payload.background;
        const idMap = new Map(payload.layers.map((pl) => [pl.id, uid()]));
        const layers: MotionLayer[] = payload.layers.map((pl) => {
          const anim = defaultAnimation(doc.duration);
          anim.inPreset = 'none';
          anim.outPreset = 'none';
          const layer: MotionLayer = {
            id: idMap.get(pl.id)!,
            type: pl.kind,
            name: pl.name || 'Layer',
            x: Math.round(pl.x),
            y: Math.round(pl.y),
            width: Math.max(1, Math.round(pl.w)),
            height: Math.max(1, Math.round(pl.h)),
            rotation: pl.rotation || 0,
            opacity: pl.opacity ?? 1,
            // Frames/groups carry their background fill (empty = transparent);
            // shapes fall back to a default fill.
            fill: pl.kind === 'group' ? (pl.fill || '') : (pl.fill || '#3B82F6'),
            cornerRadius: pl.cornerRadius || 0,
            parentId: pl.parentId ? idMap.get(pl.parentId) ?? null : null,
            visible: true,
            locked: false,
            animation: anim,
          };
          if (pl.kind === 'text') {
            layer.text = pl.text ?? '';
            layer.fontSize = pl.fontSize ?? 48;
            layer.fontFamily = 'Inter, system-ui, sans-serif';
            layer.fontWeight = pl.fontWeight ?? 400;
            layer.color = pl.color ?? '#FFFFFF';
            layer.align = pl.align ?? 'left';
          }
          if (pl.kind === 'image') layer.src = pl.src;
          // Imported frames/groups land collapsed so the panel stays tidy.
          if (pl.kind === 'group') layer.collapsed = true;
          return layer;
        });
        return {
          doc: { ...doc, layers: [...doc.layers, ...layers] },
          selectedId: null,
          selectedIds: layers.map((l) => l.id),
        };
      }

      // v1 — drop the frame in as a single full-bleed image layer.
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
        selectedIds: [layer.id],
      };
    }),

  updateLayer: (id, patch) =>
    set((state) => ({
      doc: {
        ...state.doc,
        layers: state.doc.layers.map((l) => (l.id === id ? { ...l, ...patch } : l)),
      },
    })),

  setLayerPositions: (positions) =>
    set((state) => {
      const map = new Map(positions.map((p) => [p.id, p]));
      return {
        doc: {
          ...state.doc,
          layers: state.doc.layers.map((l) => {
            const p = map.get(l.id);
            return p ? { ...l, x: p.x, y: p.y } : l;
          }),
        },
      };
    }),

  removeLayer: (id) =>
    set((state) => {
      const doomed = withDescendants(state.doc.layers, id);
      const layers = state.doc.layers.filter((l) => !doomed.has(l.id));
      return {
        doc: { ...state.doc, layers },
        selectedIds: state.selectedIds.filter((s) => !doomed.has(s)),
        selectedId: state.selectedId && doomed.has(state.selectedId) ? null : state.selectedId,
      };
    }),

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
      return { doc: { ...state.doc, layers }, selectedId: copy.id, selectedIds: [copy.id] };
    }),

  reorderLayer: (fromIndex, toIndex) =>
    set((state) => ({ doc: { ...state.doc, layers: moveWithin(state.doc.layers, fromIndex, toIndex) } })),

  selectLayer: (id, additive = false) =>
    set((state) => {
      if (id === null) return { selectedId: null, selectedIds: [] };
      if (additive) {
        const has = state.selectedIds.includes(id);
        const selectedIds = has ? state.selectedIds.filter((s) => s !== id) : [...state.selectedIds, id];
        return { selectedIds, selectedId: selectedIds[selectedIds.length - 1] ?? null };
      }
      return { selectedId: id, selectedIds: [id] };
    }),

  selectMany: (ids) => set({ selectedIds: ids, selectedId: ids[ids.length - 1] ?? null }),

  bringForward: (id) =>
    set((state) => {
      const { idx, siblings } = siblingIndices(state.doc.layers, id);
      const next = siblings.find((i) => i > idx);
      if (next === undefined) return state;
      const layers = [...state.doc.layers];
      [layers[idx], layers[next]] = [layers[next], layers[idx]];
      return { doc: { ...state.doc, layers } };
    }),

  sendBackward: (id) =>
    set((state) => {
      const { idx, siblings } = siblingIndices(state.doc.layers, id);
      const prev = [...siblings].reverse().find((i) => i < idx);
      if (prev === undefined) return state;
      const layers = [...state.doc.layers];
      [layers[idx], layers[prev]] = [layers[prev], layers[idx]];
      return { doc: { ...state.doc, layers } };
    }),

  bringToFront: (id) =>
    set((state) => {
      const { idx, siblings } = siblingIndices(state.doc.layers, id);
      const last = siblings[siblings.length - 1];
      if (last === undefined || last === idx) return state;
      return { doc: { ...state.doc, layers: moveWithin(state.doc.layers, idx, last) } };
    }),

  sendToBack: (id) =>
    set((state) => {
      const { idx, siblings } = siblingIndices(state.doc.layers, id);
      const first = siblings[0];
      if (first === undefined || first === idx) return state;
      return { doc: { ...state.doc, layers: moveWithin(state.doc.layers, idx, first) } };
    }),

  groupSelection: () =>
    set((state) => {
      const ids = state.selectedIds.filter((id) => state.doc.layers.some((l) => l.id === id));
      if (ids.length < 2) return state;
      const members = state.doc.layers.filter((l) => ids.includes(l.id));
      // Group inherits the parent of the topmost member.
      const topIdx = Math.max(...members.map((m) => state.doc.layers.findIndex((l) => l.id === m.id)));
      const parentId = state.doc.layers[topIdx].parentId ?? null;
      const minX = Math.min(...members.map((m) => m.x));
      const minY = Math.min(...members.map((m) => m.y));
      const maxX = Math.max(...members.map((m) => m.x + m.width));
      const maxY = Math.max(...members.map((m) => m.y + m.height));
      const group = makeLayer('group', state.doc, {
        parentId,
        x: minX,
        y: minY,
        width: maxX - minX,
        height: maxY - minY,
      });
      // Default group animation has no presets so it doesn't alter children
      // until the user gives it one.
      group.animation = { ...group.animation, inPreset: 'none', outPreset: 'none' };
      const layers = state.doc.layers.map((l) =>
        ids.includes(l.id) ? { ...l, parentId: group.id } : l,
      );
      // Insert the group just after the topmost member's position.
      layers.splice(topIdx + 1, 0, group);
      return { doc: { ...state.doc, layers }, selectedId: group.id, selectedIds: [group.id] };
    }),

  ungroup: (groupId) =>
    set((state) => {
      const group = state.doc.layers.find((l) => l.id === groupId);
      if (!group || group.type !== 'group') return state;
      const layers = state.doc.layers
        .filter((l) => l.id !== groupId)
        .map((l) => (l.parentId === groupId ? { ...l, parentId: group.parentId ?? null } : l));
      const freed = state.doc.layers.filter((l) => l.parentId === groupId).map((l) => l.id);
      return { doc: { ...state.doc, layers }, selectedId: freed[freed.length - 1] ?? null, selectedIds: freed };
    }),

  setLayerSpan: (id, start, end) =>
    set((state) => {
      const s = Math.max(0, snap(start));
      const e = Math.max(s + MIN_SPAN, snap(end));
      // Grow the composition live so a clip can be dragged/resized past the
      // current end — the duration tracks the longest clip. It only grows here
      // (never shrinks mid-drag); use Auto-fit or Duration − to pull it back in.
      const duration = Math.max(state.doc.duration, Math.ceil(e * 10) / 10);
      return {
        doc: {
          ...state.doc,
          duration,
          layers: state.doc.layers.map((l) =>
            l.id === id ? { ...l, animation: { ...l.animation, start: s, end: e } } : l,
          ),
        },
      };
    }),

  setTime: (t) => set((state) => ({ time: Math.max(0, Math.min(state.doc.duration, t)) })),
  setPlaying: (v) => set({ isPlaying: v }),
  setDuration: (seconds) =>
    set((state) => {
      const duration = Math.max(0.5, seconds);
      return {
        doc: {
          ...state.doc,
          duration,
          // Keep any clip that ended at the old comp end pinned to the new end.
          layers: state.doc.layers.map((l) =>
            l.animation.end >= state.doc.duration - 0.001
              ? { ...l, animation: { ...l.animation, end: duration } }
              : l,
          ),
        },
        time: Math.min(state.time, duration),
      };
    }),
  autoFitDuration: () =>
    set((state) => {
      // Fit the composition to the longest layer: the maximum clip end across
      // all visual layers (groups are containers, so they don't count).
      const ends = state.doc.layers
        .filter((l) => l.type !== 'group')
        .map((l) => l.animation.end);
      if (!ends.length) return state;
      const duration = Math.max(0.5, Math.ceil(Math.max(...ends) * 10) / 10);
      return {
        doc: { ...state.doc, duration },
        time: Math.min(state.time, duration),
      };
    }),
  loadDoc: (doc) => set({ doc, selectedId: null, selectedIds: [], time: 0, isPlaying: false }),
  setBackground: (color) => set((state) => ({ doc: { ...state.doc, background: color } })),
  setTimelineHeight: (h) => set({ timelineHeight: Math.max(140, Math.min(640, h)) }),
  setTimelineZoom: (z) => set({ timelineZoom: z === null ? null : Math.max(8, Math.min(2000, z)) }),
}));
