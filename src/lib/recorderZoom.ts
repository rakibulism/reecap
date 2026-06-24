// Screen Recorder — auto-zoom engine.
//
// Pure functions shared by the live preview and the export renderer. Given a
// time and the click marks, compute the zoom transform (scale + focal point),
// and crop/draw a video frame accordingly.

import type { ClickMark, ZoomSettings } from '../types/recorder';

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
const smoothstep = (a: number, b: number, x: number) => {
  const t = clamp((x - a) / (b - a || 1), 0, 1);
  return t * t * (3 - 2 * t);
};

export interface ZoomState {
  scale: number; // 1 = no zoom
  cx: number; // focal point, 0–1
  cy: number;
}

// Each click owns a window [t, t+in+hold+out]. Within it the zoom eases in to
// `level`, holds, then eases out; the focal point tracks toward the click and
// back to centre. Later clicks win when windows overlap.
export function zoomAt(time: number, clicks: ClickMark[], s: ZoomSettings): ZoomState {
  if (!s.enabled) return { scale: 1, cx: 0.5, cy: 0.5 };
  let active: ClickMark | null = null;
  for (const c of clicks) {
    if (c.disabled) continue;
    const end = c.t + s.inDur + s.hold + s.outDur;
    if (time >= c.t && time < end) active = c; // later overrides
  }
  if (!active) return { scale: 1, cx: 0.5, cy: 0.5 };

  const inEnd = active.t + s.inDur;
  const holdEnd = inEnd + s.hold;
  const end = holdEnd + s.outDur;
  let k: number;
  if (time < inEnd) k = smoothstep(active.t, inEnd, time);
  else if (time < holdEnd) k = 1;
  else k = 1 - smoothstep(holdEnd, end, time);

  return {
    scale: 1 + (s.level - 1) * k,
    cx: 0.5 + (active.x - 0.5) * k,
    cy: 0.5 + (active.y - 0.5) * k,
  };
}

// Draw a video frame into a canvas, cropped+scaled to apply the zoom transform.
// Both canvas and source are treated at the video's native resolution.
export function drawZoomedFrame(
  ctx: CanvasRenderingContext2D,
  video: HTMLVideoElement,
  z: ZoomState,
  cw: number,
  ch: number,
) {
  const vw = video.videoWidth || cw;
  const vh = video.videoHeight || ch;
  const sw = vw / z.scale;
  const sh = vh / z.scale;
  const sx = clamp(z.cx * vw - sw / 2, 0, vw - sw);
  const sy = clamp(z.cy * vh - sh / 2, 0, vh - sh);
  ctx.drawImage(video, sx, sy, sw, sh, 0, 0, cw, ch);
}
