// Design tool — data model.
//
// The Design tool is an infinite-canvas vector editor (Figma-style). A document
// is a flat list of free-floating nodes positioned in an unbounded "world"
// coordinate space; the canvas applies a pan/zoom viewport transform on top.
//
// Geometry convention: every node has an axis-aligned bounding box
// (x, y, width, height) in world units. Path-like nodes (line, arrow, pen,
// pencil, polygon, star) additionally carry `points` expressed as NORMALISED
// coordinates (0–1) inside that box, so moving a node only changes x/y and
// resizing only changes width/height — the points ride along for free.

export type DesignTool =
  | 'select'
  | 'hand'
  | 'frame'
  | 'rectangle'
  | 'ellipse'
  | 'line'
  | 'arrow'
  | 'polygon'
  | 'star'
  | 'pen'
  | 'pencil'
  | 'text'
  | 'text-path'
  | 'image'
  | 'video';

export type DesignNodeType =
  | 'frame'
  | 'rectangle'
  | 'ellipse'
  | 'line'
  | 'arrow'
  | 'polygon'
  | 'star'
  | 'path' // pen
  | 'pencil'
  | 'text'
  | 'text-path'
  | 'image'
  | 'video';

export interface Pt {
  x: number; // 0–1 within the node box
  y: number; // 0–1 within the node box
}

export type TextAlign = 'left' | 'center' | 'right';

export interface DesignNode {
  id: string;
  type: DesignNodeType;
  name: string;

  // Bounding box in world units.
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number; // degrees, around the box centre
  opacity: number; // 0–1

  visible: boolean;
  locked: boolean;
  parentId: string | null; // frame membership (visual grouping)

  // Paint
  fill: string; // '' = no fill
  stroke: string; // '' = no stroke
  strokeWidth: number;
  cornerRadius: number; // rectangle / frame

  // Path-like geometry (line, arrow, pen path, pencil) — normalised points.
  points?: Pt[];
  closed?: boolean;

  // Polygon / star
  sides?: number; // polygon sides, or star point count
  innerRatio?: number; // star inner-radius ratio (0–1)

  // Text + text-on-path
  text?: string;
  fontSize?: number;
  fontFamily?: string;
  fontWeight?: number;
  color?: string; // text colour
  align?: TextAlign;
  letterSpacing?: number;
  arc?: number; // text-path bend, -1…1 (0 = straight)

  // Media
  src?: string;
  naturalWidth?: number;
  naturalHeight?: number;
}

export interface DesignDoc {
  nodes: DesignNode[];
  background: string;
}

export interface Viewport {
  tx: number; // screen px offset
  ty: number;
  zoom: number; // scale factor (1 = 100%)
}
