// Motion Design tool — data model.
//
// The motion document is deliberately decoupled from the photo/slide model in
// `types/index.ts`: it describes a single composition of free-floating layers
// that animate over a timeline, rather than a sequence of slides.

export type LayerType = 'text' | 'rectangle' | 'ellipse' | 'image' | 'group';

// Keyframe-free animation presets. Each layer picks an *In* preset (how it
// enters) and an *Out* preset (how it leaves); the engine maps these to CSS.
export type AnimationPreset =
  | 'none'
  | 'fade'
  | 'slide-up'
  | 'slide-down'
  | 'slide-left'
  | 'slide-right'
  | 'scale'
  | 'pop'
  | 'blur'
  | 'rotate';

export type EasingPreset =
  | 'linear'
  | 'ease'
  | 'ease-in'
  | 'ease-out'
  | 'ease-in-out'
  | 'spring'
  | 'bounce';

export type TextAlign = 'left' | 'center' | 'right';

export interface LayerAnimation {
  inPreset: AnimationPreset;
  outPreset: AnimationPreset;
  start: number;        // seconds — clip in-point; the In animation begins here
  end: number;          // seconds — clip out-point; the Out animation ends here
  inDuration: number;   // seconds — length of the In animation
  outDuration: number;  // seconds — length of the Out animation (ends at `end`)
  easing: EasingPreset;
  intensity: number;    // 0–1 — scales travel distance / scale / rotation amount
}

export interface MotionLayer {
  id: string;
  type: LayerType;
  name: string;

  // Geometry, in composition (design) units — see MotionDoc.width/height.
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;     // degrees
  opacity: number;      // 0–1 (resting opacity, before animation)

  // Shape appearance
  fill: string;         // hex / css color
  cornerRadius: number; // px (rectangle)

  // Text appearance (type === 'text')
  text?: string;
  fontSize?: number;
  fontFamily?: string;
  fontWeight?: number;
  color?: string;
  align?: TextAlign;

  // Image source (type === 'image')
  src?: string;

  // Group membership — a layer with `parentId` set belongs to that group layer.
  // Coordinates remain absolute in composition space; groups are containers for
  // selection / move-together / animate-together, not a nested coordinate system.
  parentId?: string | null;
  collapsed?: boolean;  // group rows can be collapsed in the layers panel

  visible: boolean;
  locked: boolean;

  animation: LayerAnimation;
}

export interface MotionDoc {
  width: number;        // composition width in design units
  height: number;       // composition height in design units
  duration: number;     // total timeline length, seconds
  background: string;   // composition background color
  layers: MotionLayer[];
}

// One node in a Figma frame export (payload v2). Geometry is in composition
// units, relative to the frame origin. `kind` decides how the app reconstructs
// it; anything not natively representable arrives as kind 'image' with `src`.
export interface PayloadLayer {
  id: string;                 // Figma node id (remapped to a fresh id on import)
  parentId: string | null;    // Figma node id of the enclosing group, or null
  name: string;
  kind: LayerType;            // 'text' | 'rectangle' | 'ellipse' | 'image' | 'group'
  x: number;
  y: number;
  w: number;
  h: number;
  rotation: number;
  opacity: number;
  // text
  text?: string;
  fontSize?: number;
  fontWeight?: number;
  color?: string;
  align?: TextAlign;
  // shape
  fill?: string;
  cornerRadius?: number;
  // image (rasterized leaf)
  src?: string;               // data URL (PNG)
}

// Clipboard payload produced by the companion Figma plugin and reconstructed by
// the in-app paste handler. v1 carried only a flat `image`; v2 adds an editable
// `layers` tree (the `image` is kept as a fallback).
export interface ReecapMotionPayload {
  __reecap: 'motion-frame';
  version: number;
  width: number;
  height: number;
  name?: string;
  image: string;        // data URL (PNG) — full-frame fallback
  layers?: PayloadLayer[];
}
