import { create } from 'zustand';
import type { DesignDoc, DesignNode, DesignNodeType, DesignTool, Viewport } from '../types/design';
import { polygonPoints, starPoints } from '../lib/designGeometry';

const uid = () => Math.random().toString(36).slice(2, 10);

const DEFAULT_DOC: DesignDoc = {
  nodes: [],
  background: '#F4F4F5',
};

const DEFAULT_VIEWPORT: Viewport = { tx: 0, ty: 0, zoom: 1 };

let nameCounters: Record<string, number> = {};
function nodeName(type: DesignNodeType): string {
  const label: Record<DesignNodeType, string> = {
    frame: 'Frame',
    rectangle: 'Rectangle',
    ellipse: 'Ellipse',
    line: 'Line',
    arrow: 'Arrow',
    polygon: 'Polygon',
    star: 'Star',
    path: 'Path',
    pencil: 'Drawing',
    text: 'Text',
    'text-path': 'Curved text',
    image: 'Image',
    video: 'Video',
  };
  nameCounters[type] = (nameCounters[type] ?? 0) + 1;
  return `${label[type]} ${nameCounters[type]}`;
}

// Per-type node factory. Geometry (x/y/width/height/points) is supplied by the
// caller from the drawing gesture; this fills in sensible paint + type fields.
export function makeNode(type: DesignNodeType, patch: Partial<DesignNode> = {}): DesignNode {
  const base: DesignNode = {
    id: uid(),
    type,
    name: patch.name ?? nodeName(type),
    x: patch.x ?? 0,
    y: patch.y ?? 0,
    width: patch.width ?? 160,
    height: patch.height ?? 160,
    rotation: 0,
    opacity: 1,
    visible: true,
    locked: false,
    parentId: patch.parentId ?? null,
    fill: '#3B82F6',
    stroke: '',
    strokeWidth: 0,
    cornerRadius: 0,
    ...patch,
  };

  switch (type) {
    case 'frame':
      base.fill = patch.fill ?? '#FFFFFF';
      base.stroke = patch.stroke ?? '#D4D4D8';
      base.strokeWidth = patch.strokeWidth ?? 1;
      break;
    case 'rectangle':
      base.cornerRadius = patch.cornerRadius ?? 8;
      break;
    case 'ellipse':
      base.fill = patch.fill ?? '#A855F7';
      break;
    case 'line':
      base.fill = '';
      base.stroke = patch.stroke ?? '#18181B';
      base.strokeWidth = patch.strokeWidth ?? 2;
      base.points = patch.points ?? [{ x: 0, y: 0.5 }, { x: 1, y: 0.5 }];
      break;
    case 'arrow':
      base.fill = '';
      base.stroke = patch.stroke ?? '#18181B';
      base.strokeWidth = patch.strokeWidth ?? 2;
      base.points = patch.points ?? [{ x: 0, y: 0.5 }, { x: 1, y: 0.5 }];
      break;
    case 'polygon':
      base.fill = patch.fill ?? '#F97316';
      base.sides = patch.sides ?? 6;
      base.points = patch.points ?? polygonPoints(base.sides);
      break;
    case 'star':
      base.fill = patch.fill ?? '#FACC15';
      base.sides = patch.sides ?? 5;
      base.innerRatio = patch.innerRatio ?? 0.45;
      base.points = patch.points ?? starPoints(base.sides, base.innerRatio);
      break;
    case 'path':
      base.fill = patch.fill ?? '';
      base.stroke = patch.stroke ?? '#18181B';
      base.strokeWidth = patch.strokeWidth ?? 2;
      base.closed = patch.closed ?? false;
      base.points = patch.points ?? [];
      break;
    case 'pencil':
      base.fill = '';
      base.stroke = patch.stroke ?? '#18181B';
      base.strokeWidth = patch.strokeWidth ?? 3;
      base.points = patch.points ?? [];
      break;
    case 'text':
      base.fill = '';
      base.text = patch.text ?? 'Text';
      base.fontSize = patch.fontSize ?? 40;
      base.fontFamily = patch.fontFamily ?? 'Inter, system-ui, sans-serif';
      base.fontWeight = patch.fontWeight ?? 600;
      base.color = patch.color ?? '#18181B';
      base.align = patch.align ?? 'left';
      base.letterSpacing = patch.letterSpacing ?? 0;
      break;
    case 'text-path':
      base.fill = '';
      base.text = patch.text ?? 'Curved text';
      base.fontSize = patch.fontSize ?? 40;
      base.fontFamily = patch.fontFamily ?? 'Inter, system-ui, sans-serif';
      base.fontWeight = patch.fontWeight ?? 600;
      base.color = patch.color ?? '#18181B';
      base.align = patch.align ?? 'center';
      base.arc = patch.arc ?? 0.5;
      break;
    case 'image':
    case 'video':
      base.fill = '';
      break;
  }
  return base;
}

interface DesignState {
  doc: DesignDoc;
  tool: DesignTool;
  viewport: Viewport;
  selectedIds: string[];
  editingId: string | null; // text node being edited inline
  devMode: boolean;
  showGrid: boolean;

  // tool / view
  setTool: (t: DesignTool) => void;
  setViewport: (v: Partial<Viewport>) => void;
  panBy: (dx: number, dy: number) => void;
  zoomAt: (factor: number, cx: number, cy: number) => void;
  setZoom: (zoom: number, cx?: number, cy?: number) => void;
  resetView: () => void;
  toggleGrid: () => void;
  toggleDevMode: () => void;

  // selection
  select: (id: string | null, additive?: boolean) => void;
  selectMany: (ids: string[]) => void;
  clearSelection: () => void;
  setEditing: (id: string | null) => void;

  // nodes
  addNode: (node: DesignNode, opts?: { select?: boolean }) => string;
  updateNode: (id: string, patch: Partial<DesignNode>) => void;
  updateNodes: (ids: string[], fn: (n: DesignNode) => Partial<DesignNode>) => void;
  removeNode: (id: string) => void;
  removeSelected: () => void;
  duplicateSelected: () => void;
  setBackground: (color: string) => void;

  // z-order (operates on the primary selection)
  bringForward: () => void;
  sendBackward: () => void;
  bringToFront: () => void;
  sendToBack: () => void;
}

export const useDesignStore = create<DesignState>((set, get) => ({
  doc: DEFAULT_DOC,
  tool: 'select',
  viewport: DEFAULT_VIEWPORT,
  selectedIds: [],
  editingId: null,
  devMode: false,
  showGrid: true,

  setTool: (tool) => set({ tool, editingId: null }),
  setViewport: (v) => set((s) => ({ viewport: { ...s.viewport, ...v } })),
  panBy: (dx, dy) => set((s) => ({ viewport: { ...s.viewport, tx: s.viewport.tx + dx, ty: s.viewport.ty + dy } })),
  zoomAt: (factor, cx, cy) =>
    set((s) => {
      const { tx, ty, zoom } = s.viewport;
      const next = Math.max(0.02, Math.min(64, zoom * factor));
      // Keep the world point under (cx,cy) fixed on screen.
      const wx = (cx - tx) / zoom;
      const wy = (cy - ty) / zoom;
      return { viewport: { zoom: next, tx: cx - wx * next, ty: cy - wy * next } };
    }),
  setZoom: (zoom, cx = window.innerWidth / 2, cy = window.innerHeight / 2) =>
    set((s) => {
      const next = Math.max(0.02, Math.min(64, zoom));
      const wx = (cx - s.viewport.tx) / s.viewport.zoom;
      const wy = (cy - s.viewport.ty) / s.viewport.zoom;
      return { viewport: { zoom: next, tx: cx - wx * next, ty: cy - wy * next } };
    }),
  resetView: () => set({ viewport: DEFAULT_VIEWPORT }),
  toggleGrid: () => set((s) => ({ showGrid: !s.showGrid })),
  toggleDevMode: () => set((s) => ({ devMode: !s.devMode, tool: 'select' })),

  select: (id, additive = false) =>
    set((s) => {
      if (id === null) return { selectedIds: [] };
      if (!additive) return { selectedIds: [id] };
      return { selectedIds: s.selectedIds.includes(id) ? s.selectedIds.filter((x) => x !== id) : [...s.selectedIds, id] };
    }),
  selectMany: (ids) => set({ selectedIds: ids }),
  clearSelection: () => set({ selectedIds: [], editingId: null }),
  setEditing: (id) => set({ editingId: id }),

  addNode: (node, opts = { select: true }) => {
    set((s) => ({
      doc: { ...s.doc, nodes: [...s.doc.nodes, node] },
      selectedIds: opts.select ? [node.id] : s.selectedIds,
    }));
    return node.id;
  },
  updateNode: (id, patch) =>
    set((s) => ({
      doc: { ...s.doc, nodes: s.doc.nodes.map((n) => (n.id === id ? { ...n, ...patch } : n)) },
    })),
  updateNodes: (ids, fn) =>
    set((s) => ({
      doc: { ...s.doc, nodes: s.doc.nodes.map((n) => (ids.includes(n.id) ? { ...n, ...fn(n) } : n)) },
    })),
  removeNode: (id) =>
    set((s) => ({
      doc: { ...s.doc, nodes: s.doc.nodes.filter((n) => n.id !== id && n.parentId !== id) },
      selectedIds: s.selectedIds.filter((x) => x !== id),
    })),
  removeSelected: () =>
    set((s) => {
      const ids = new Set(s.selectedIds);
      return {
        doc: { ...s.doc, nodes: s.doc.nodes.filter((n) => !ids.has(n.id) && !(n.parentId && ids.has(n.parentId))) },
        selectedIds: [],
        editingId: null,
      };
    }),
  duplicateSelected: () =>
    set((s) => {
      const ids = new Set(s.selectedIds);
      const clones: DesignNode[] = [];
      for (const n of s.doc.nodes) {
        if (ids.has(n.id)) clones.push({ ...n, id: uid(), name: `${n.name} copy`, x: n.x + 24, y: n.y + 24 });
      }
      return { doc: { ...s.doc, nodes: [...s.doc.nodes, ...clones] }, selectedIds: clones.map((c) => c.id) };
    }),
  setBackground: (color) => set((s) => ({ doc: { ...s.doc, background: color } })),

  bringForward: () => reorder(get, set, 'forward'),
  sendBackward: () => reorder(get, set, 'backward'),
  bringToFront: () => reorder(get, set, 'front'),
  sendToBack: () => reorder(get, set, 'back'),
}));

type Dir = 'forward' | 'backward' | 'front' | 'back';
function reorder(get: () => DesignState, set: (p: Partial<DesignState>) => void, dir: Dir) {
  const s = get();
  const id = s.selectedIds[0];
  if (!id) return;
  const nodes = [...s.doc.nodes];
  const i = nodes.findIndex((n) => n.id === id);
  if (i < 0) return;
  const [node] = nodes.splice(i, 1);
  if (dir === 'front') nodes.push(node);
  else if (dir === 'back') nodes.unshift(node);
  else if (dir === 'forward') nodes.splice(Math.min(nodes.length, i + 1), 0, node);
  else nodes.splice(Math.max(0, i - 1), 0, node);
  set({ doc: { ...s.doc, nodes } });
}
