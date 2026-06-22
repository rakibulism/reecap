// Motion Design tool — keyframe-free animation engine.
//
// A layer carries an In preset and an Out preset. Given the current playhead
// time, `computeLayerStyle` returns the CSS the canvas (and, later, the
// exporter) should apply. Everything here is pure so it can be unit-tested and
// reused outside React.

import type {
  AnimationPreset,
  EasingPreset,
  LayerAnimation,
  MotionLayer,
} from '../types/motion';

// --- Easing -----------------------------------------------------------------

// Cubic-bezier sampler (Newton-Raphson on x, then evaluate y). Mirrors the
// browser's `cubic-bezier()` timing function so previews match CSS intuition.
function cubicBezier(x1: number, y1: number, x2: number, y2: number) {
  const cx = 3 * x1;
  const bx = 3 * (x2 - x1) - cx;
  const ax = 1 - cx - bx;
  const cy = 3 * y1;
  const by = 3 * (y2 - y1) - cy;
  const ay = 1 - cy - by;

  const sampleX = (t: number) => ((ax * t + bx) * t + cx) * t;
  const sampleY = (t: number) => ((ay * t + by) * t + cy) * t;
  const sampleDX = (t: number) => (3 * ax * t + 2 * bx) * t + cx;

  return (x: number) => {
    if (x <= 0) return 0;
    if (x >= 1) return 1;
    let t = x;
    for (let i = 0; i < 8; i++) {
      const dx = sampleX(t) - x;
      if (Math.abs(dx) < 1e-4) break;
      const d = sampleDX(t);
      if (Math.abs(d) < 1e-6) break;
      t -= dx / d;
    }
    return sampleY(Math.min(1, Math.max(0, t)));
  };
}

// Closed-form, slightly-overshooting "spring" feel.
function springEase(t: number): number {
  if (t <= 0) return 0;
  if (t >= 1) return 1;
  return 1 - Math.cos(t * Math.PI * 0.5 * 1.18) * Math.exp(-t * 3.2);
}

// Classic ease-out bounce.
function bounceEase(t: number): number {
  const n1 = 7.5625;
  const d1 = 2.75;
  if (t < 1 / d1) return n1 * t * t;
  if (t < 2 / d1) return n1 * (t -= 1.5 / d1) * t + 0.75;
  if (t < 2.5 / d1) return n1 * (t -= 2.25 / d1) * t + 0.9375;
  return n1 * (t -= 2.625 / d1) * t + 0.984375;
}

export const easings: Record<EasingPreset, (t: number) => number> = {
  linear: (t) => t,
  ease: cubicBezier(0.25, 0.1, 0.25, 1),
  'ease-in': cubicBezier(0.42, 0, 1, 1),
  'ease-out': cubicBezier(0, 0, 0.58, 1),
  'ease-in-out': cubicBezier(0.42, 0, 0.58, 1),
  spring: springEase,
  bounce: bounceEase,
};

export const ANIMATION_PRESETS: { value: AnimationPreset; label: string }[] = [
  { value: 'none', label: 'None' },
  { value: 'fade', label: 'Fade' },
  { value: 'slide-up', label: 'Slide ↑' },
  { value: 'slide-down', label: 'Slide ↓' },
  { value: 'slide-left', label: 'Slide ←' },
  { value: 'slide-right', label: 'Slide →' },
  { value: 'scale', label: 'Scale' },
  { value: 'pop', label: 'Pop' },
  { value: 'blur', label: 'Blur' },
  { value: 'rotate', label: 'Rotate' },
];

export const EASING_PRESETS: { value: EasingPreset; label: string }[] = [
  { value: 'linear', label: 'Linear' },
  { value: 'ease', label: 'Ease' },
  { value: 'ease-in', label: 'In' },
  { value: 'ease-out', label: 'Out' },
  { value: 'ease-in-out', label: 'In-Out' },
  { value: 'spring', label: 'Spring' },
  { value: 'bounce', label: 'Bounce' },
];

// --- Preset offsets ---------------------------------------------------------

// The "offset" state a layer animates *from* (In) or *to* (Out). Identity is
// all-zero offset with opacity 1 and scale 1.
interface OffsetState {
  opacity: number;
  dx: number;     // px, in composition units
  dy: number;     // px
  scale: number;
  rotate: number; // degrees
  blur: number;   // px
}

const IDENTITY: OffsetState = { opacity: 1, dx: 0, dy: 0, scale: 1, rotate: 0, blur: 0 };

// Travel distance for slide presets, scaled by intensity (0–1).
const SLIDE_DISTANCE = 120;

function presetOffset(preset: AnimationPreset, intensity: number): OffsetState {
  const k = Math.max(0, Math.min(1, intensity));
  const dist = SLIDE_DISTANCE * (0.4 + k);
  switch (preset) {
    case 'none':
      return { ...IDENTITY };
    case 'fade':
      return { ...IDENTITY, opacity: 0 };
    case 'slide-up':
      return { ...IDENTITY, opacity: 0, dy: dist };
    case 'slide-down':
      return { ...IDENTITY, opacity: 0, dy: -dist };
    case 'slide-left':
      return { ...IDENTITY, opacity: 0, dx: dist };
    case 'slide-right':
      return { ...IDENTITY, opacity: 0, dx: -dist };
    case 'scale':
      return { ...IDENTITY, opacity: 0, scale: 1 - 0.4 * (0.5 + k * 0.5) };
    case 'pop':
      return { ...IDENTITY, opacity: 0, scale: 0.5 + 0.3 * (1 - k) };
    case 'blur':
      return { ...IDENTITY, opacity: 0, blur: 6 + 18 * k };
    case 'rotate':
      return { ...IDENTITY, opacity: 0, rotate: -90 * (0.4 + k), scale: 0.9 };
    default:
      return { ...IDENTITY };
  }
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function lerpOffset(from: OffsetState, to: OffsetState, t: number): OffsetState {
  return {
    opacity: lerp(from.opacity, to.opacity, t),
    dx: lerp(from.dx, to.dx, t),
    dy: lerp(from.dy, to.dy, t),
    scale: lerp(from.scale, to.scale, t),
    rotate: lerp(from.rotate, to.rotate, t),
    blur: lerp(from.blur, to.blur, t),
  };
}

export interface ComputedStyle {
  opacity: number;
  transform: string;  // appended after the base translate (in design units)
  filter: string;
  hidden: boolean;    // true before the In starts (nothing to show yet)
}

/**
 * Resolve the animated state of a layer at a given playhead time (seconds),
 * within a composition of the given total duration.
 */
export function computeLayerStyle(
  layer: MotionLayer,
  time: number,
  docDuration: number,
): ComputedStyle {
  const a: LayerAnimation = layer.animation;
  const ease = easings[a.easing] ?? easings.ease;

  // Clip lifespan: [start, end]. `end` falls back to the composition duration
  // for layers authored before clip-ends existed.
  const inStart = a.start;
  const inEnd = a.start + a.inDuration;
  const outEnd = typeof a.end === 'number' ? a.end : docDuration;
  const outStart = Math.max(inEnd, outEnd - a.outDuration);

  let offset: OffsetState;
  let hidden = false;

  if (time < inStart) {
    // Before the clip starts — not on stage yet.
    offset = presetOffset(a.inPreset, a.intensity);
    hidden = true;
  } else if (time > outEnd) {
    // After the clip ends — off stage.
    offset = presetOffset(a.outPreset, a.intensity);
    hidden = true;
  } else if (time < inEnd && a.inDuration > 0) {
    const p = ease((time - inStart) / a.inDuration);
    offset = lerpOffset(presetOffset(a.inPreset, a.intensity), IDENTITY, p);
  } else if (time < outStart || a.outPreset === 'none' || a.outDuration <= 0) {
    offset = { ...IDENTITY };
  } else {
    const p = ease((time - outStart) / a.outDuration);
    offset = lerpOffset(IDENTITY, presetOffset(a.outPreset, a.intensity), p);
  }

  const transformParts: string[] = [];
  if (offset.dx || offset.dy) transformParts.push(`translate(${offset.dx}px, ${offset.dy}px)`);
  if (layer.rotation || offset.rotate) transformParts.push(`rotate(${layer.rotation + offset.rotate}deg)`);
  if (offset.scale !== 1) transformParts.push(`scale(${offset.scale})`);

  return {
    opacity: Math.max(0, Math.min(1, layer.opacity * offset.opacity)),
    transform: transformParts.join(' '),
    filter: offset.blur > 0.01 ? `blur(${offset.blur}px)` : 'none',
    hidden,
  };
}

// Sensible default animation for newly-created layers. The clip spans the whole
// composition by default (start 0 → end = duration).
export function defaultAnimation(duration = 4): LayerAnimation {
  return {
    inPreset: 'fade',
    outPreset: 'none',
    start: 0,
    end: duration,
    inDuration: 0.6,
    outDuration: 0.6,
    easing: 'ease-out',
    intensity: 0.6,
  };
}

/**
 * Resolve a layer's style including the composed effect of its ancestor groups,
 * so animating (or moving) a group animates its whole subtree. Group offsets
 * multiply opacity and concatenate transforms; group `hidden` hides descendants.
 */
export function computeLayerStyleWithAncestors(
  layer: MotionLayer,
  layersById: Map<string, MotionLayer>,
  time: number,
  docDuration: number,
): ComputedStyle {
  const self = computeLayerStyle(layer, time, docDuration);
  let opacity = self.opacity;
  let hidden = self.hidden;
  const transforms = self.transform ? [self.transform] : [];
  const filters = self.filter !== 'none' ? [self.filter] : [];

  let parentId = layer.parentId;
  const guard = new Set<string>();
  while (parentId && !guard.has(parentId)) {
    guard.add(parentId);
    const parent = layersById.get(parentId);
    if (!parent) break;
    const ps = computeLayerStyle(parent, time, docDuration);
    opacity *= ps.opacity;
    if (ps.hidden) hidden = true;
    if (ps.transform) transforms.unshift(ps.transform);
    if (ps.filter !== 'none') filters.push(ps.filter);
    parentId = parent.parentId;
  }

  return {
    opacity,
    transform: transforms.join(' '),
    filter: filters.length ? filters.join(' ') : 'none',
    hidden,
  };
}
