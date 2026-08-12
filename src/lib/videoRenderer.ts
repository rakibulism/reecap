import { type Photo, type ReecapSettings } from '../types';
import { slideDuration, captionAnchor } from './utils';

export interface TimelineClip {
  photo: Photo;
  start: number;   // seconds
  end: number;     // seconds
  duration: number;
}

// Fraction of a slide (at its tail) during which the next slide transitions in.
// Matches the live preview (transitionStart = 0.8).
const TRANSITION_PORTION = 0.2;
// Fraction of a slide over which a caption intro animation completes.
const CAPTION_APPEAR_PORTION = 0.35;

/** Build the ordered clip timeline with absolute start/end times (speed-scaled). */
export function buildTimeline(
  photos: Photo[],
  settings: ReecapSettings,
  speed: number
): { clips: TimelineClip[]; total: number } {
  let t = 0;
  const clips: TimelineClip[] = [];
  for (const photo of photos) {
    const duration = slideDuration(photo, settings) / (speed || 1);
    clips.push({ photo, start: t, end: t + duration, duration });
    t += duration;
  }
  return { clips, total: t };
}

/** Composite the full frame for absolute time `t` onto the canvas context. */
export function renderTimelineFrame(
  ctx: CanvasRenderingContext2D,
  t: number,
  clips: TimelineClip[],
  settings: ReecapSettings,
  dims: { width: number; height: number },
  images: Map<string, HTMLImageElement>,
  watermark = false
) {
  const { width, height } = dims;

  let i = clips.findIndex((c) => t < c.end);
  if (i < 0) i = clips.length - 1;
  const clip = clips[i];
  const progress = clip.duration > 0 ? Math.min(1, Math.max(0, (t - clip.start) / clip.duration)) : 1;
  const inTransition = progress >= 1 - TRANSITION_PORTION && i < clips.length - 1;
  const p = inTransition ? (progress - (1 - TRANSITION_PORTION)) / TRANSITION_PORTION : 0;
  const next = inTransition ? clips[i + 1] : null;

  // 1. Background (crossfades during a transition in 'slide' mode).
  drawBackground(ctx, clip.photo, next?.photo, settings, width, height, p, images);

  // 2. Foreground photo(s) with per-slide transition transforms.
  drawPhotoTransition(ctx, clip.photo, settings, width, height, images, false, p);
  if (next) drawPhotoTransition(ctx, next.photo, settings, width, height, images, true, p);

  // 3. Caption for the current slide, animated by its appear progress; fades out
  // during the transition so the next slide's caption can animate in cleanly.
  if (clip.photo.caption && clip.photo.caption.trim()) {
    const appear = Math.min(1, progress / CAPTION_APPEAR_PORTION);
    drawCaption(ctx, clip.photo, width, height, appear, 1 - p);
  }

  // 4. Free-tier watermark, always on top.
  if (watermark) drawWatermark(ctx, width, height);
}

/** Persistent "Made with Reecap" watermark drawn in the bottom-right corner. */
export function drawWatermark(ctx: CanvasRenderingContext2D, width: number, height: number) {
  const fontSize = Math.max(12, Math.round(width * 0.022));
  const padX = fontSize * 0.9;
  const padY = fontSize * 0.55;
  const text = 'Made with Reecap';

  ctx.save();
  ctx.font = `600 ${fontSize}px Inter, system-ui, -apple-system, sans-serif`;
  ctx.textAlign = 'right';
  ctx.textBaseline = 'bottom';
  const textWidth = ctx.measureText(text).width;

  const boxW = textWidth + padX * 2;
  const boxH = fontSize + padY * 2;
  const x = width - fontSize * 0.6;
  const y = height - fontSize * 0.6;

  ctx.globalAlpha = 0.55;
  ctx.fillStyle = '#000000';
  ctx.beginPath();
  roundRect(ctx, x - boxW, y - boxH, boxW, boxH, boxH * 0.25);
  ctx.fill();

  ctx.globalAlpha = 0.9;
  ctx.fillStyle = '#FFFFFF';
  ctx.fillText(text, x - padX, y - padY);
  ctx.restore();
}

/** Background layer: blurred slide crossfade, solid color, or white fallback. */
function drawBackground(
  ctx: CanvasRenderingContext2D,
  current: Photo,
  next: Photo | undefined,
  settings: ReecapSettings,
  width: number,
  height: number,
  p: number,
  images: Map<string, HTMLImageElement>
) {
  if (settings.backgroundMode === 'slide') {
    const blur = settings.backgroundBlur;
    const drawCover = (photo: Photo, alpha: number) => {
      const img = images.get(photo.id);
      if (!img || alpha <= 0) return;
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.filter = `blur(${blur}px)`;
      const scale = Math.max(width / photo.width, height / photo.height) * 1.1;
      const w = photo.width * scale;
      const h = photo.height * scale;
      ctx.drawImage(img, (width - w) / 2, (height - h) / 2, w, h);
      ctx.restore();
    };
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, width, height);
    drawCover(current, 1 - p);
    if (next) drawCover(next, p);
    ctx.fillStyle = `rgba(0,0,0,${settings.backgroundOverlay / 100})`;
    ctx.fillRect(0, 0, width, height);
  } else if (settings.backgroundMode === 'color') {
    ctx.fillStyle = settings.backgroundColor;
    ctx.fillRect(0, 0, width, height);
  } else {
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, width, height);
  }
}

/** Wraps the foreground photo draw with the per-slide transition transform. */
function drawPhotoTransition(
  ctx: CanvasRenderingContext2D,
  photo: Photo,
  settings: ReecapSettings,
  width: number,
  height: number,
  images: Map<string, HTMLImageElement>,
  isNext: boolean,
  p: number
) {
  const t = photo.transition || settings.transition;
  const cx = width / 2;
  const cy = height / 2;

  let alpha = 1;
  let tx = 0;
  let ty = 0;
  let sx = 1;
  let sy = 1;
  let blur = 0;
  let clip: { x: number; y: number; w: number; h: number } | null = null;

  if (t === 'fade') {
    alpha = isNext ? p : 1 - p;
  } else if (t === 'slide') {
    tx = isNext ? (1 - p) * width : -p * width;
  } else if (t === 'slide-up') {
    ty = isNext ? (1 - p) * height : 0;
  } else if (t === 'zoom') {
    sx = sy = isNext ? 0.8 + p * 0.2 : 1 + p * 0.2;
    alpha = isNext ? p : 1 - p;
  } else if (t === 'wipe') {
    if (isNext) clip = { x: 0, y: 0, w: width * p, h: height };
  } else if (t === 'flip') {
    // Approximate the perspective Y-flip with a horizontal squash.
    if (isNext) {
      sx = Math.sin((p * Math.PI) / 2);
      alpha = p > 0.5 ? 1 : 0;
    } else {
      sx = Math.cos((p * Math.PI) / 2);
      alpha = p > 0.5 ? 0 : 1;
    }
  } else if (t === 'dissolve') {
    alpha = isNext ? p : 1 - p;
    if (p > 0 && p < 1) blur = p * 5;
  } else if (t === 'none') {
    alpha = isNext ? (p > 0.5 ? 1 : 0) : p > 0.5 ? 0 : 1;
  }

  if (alpha <= 0) return;

  ctx.save();
  ctx.globalAlpha = alpha;
  if (blur > 0) ctx.filter = `blur(${blur}px)`;
  if (tx !== 0 || ty !== 0) ctx.translate(tx, ty);
  if (sx !== 1 || sy !== 1) {
    ctx.translate(cx, cy);
    ctx.scale(sx, sy);
    ctx.translate(-cx, -cy);
  }
  if (clip) {
    ctx.beginPath();
    ctx.rect(clip.x, clip.y, clip.w, clip.h);
    ctx.clip();
  }
  drawPhotoLayer(ctx, photo, settings, width, height, images);
  ctx.restore();
}

/** Draws the foreground photo (padding, fit, radius, shadow) — no transition. */
function drawPhotoLayer(
  ctx: CanvasRenderingContext2D,
  photo: Photo,
  settings: ReecapSettings,
  width: number,
  height: number,
  images: Map<string, HTMLImageElement>
) {
  const img = images.get(photo.id);
  if (!img) return;

  const padding = settings.padding;
  const frameW = width - padding * 2;
  const frameH = height - padding * 2;

  let drawW: number;
  let drawH: number;
  if (settings.imageFit === 'cover') {
    const scale = Math.max(frameW / photo.width, frameH / photo.height);
    drawW = photo.width * scale;
    drawH = photo.height * scale;
  } else {
    const scale = Math.min(frameW / photo.width, frameH / photo.height);
    drawW = photo.width * scale;
    drawH = photo.height * scale;
  }
  const drawX = padding + (frameW - drawW) / 2;
  const drawY = padding + (frameH - drawH) / 2;

  ctx.save();
  if (settings.imageFit === 'cover') {
    // Clip to the padded frame so a cover image doesn't overflow.
    ctx.beginPath();
    roundRect(ctx, padding, padding, frameW, frameH, settings.borderRadius);
    ctx.clip();
  } else if (settings.borderRadius > 0) {
    ctx.beginPath();
    roundRect(ctx, drawX, drawY, drawW, drawH, settings.borderRadius);
    ctx.clip();
  }
  if (settings.shadow > 0) {
    ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
    ctx.shadowBlur = settings.shadow;
    ctx.shadowOffsetY = settings.shadow / 2;
  }
  ctx.drawImage(img, drawX, drawY, drawW, drawH);
  ctx.restore();
}

/** Draws the caption at its anchor with an intro animation and optional fade. */
function drawCaption(
  ctx: CanvasRenderingContext2D,
  photo: Photo,
  width: number,
  height: number,
  appear: number,
  fade: number
) {
  const anim = photo.captionAnimation || 'none';
  const anchor = captionAnchor(photo);

  let alpha = fade;
  let offsetY = 0;
  let scale = 1;
  let text = (photo.caption || '').trim();
  if (anim === 'fade') alpha *= appear;
  else if (anim === 'slide-up') { alpha *= appear; offsetY = (1 - appear) * height * 0.03; }
  else if (anim === 'slide-down') { alpha *= appear; offsetY = -(1 - appear) * height * 0.03; }
  else if (anim === 'pop') { alpha *= appear; scale = 0.8 + appear * 0.2; }
  else if (anim === 'typewriter') text = text.slice(0, Math.ceil(appear * text.length));

  if (alpha <= 0 || !text) return;

  const fontSize = Math.max(16, Math.round(width * 0.035)) * scale;
  const lineHeight = fontSize * 1.25;
  const maxWidth = width * 0.8;
  const centerX = anchor.x * width;
  const centerY = anchor.y * height + offsetY;

  ctx.save();
  ctx.globalAlpha = Math.max(0, Math.min(1, alpha));
  ctx.font = `600 ${fontSize}px Inter, system-ui, -apple-system, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';

  const words = text.split(/\s+/);
  const lines: string[] = [];
  let line = '';
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);

  const blockHeight = lines.length * lineHeight;
  const startY = centerY - blockHeight / 2;

  if (photo.captionBg) {
    const widest = Math.min(maxWidth, Math.max(...lines.map((l) => ctx.measureText(l).width)));
    const padX = fontSize * 0.5;
    const padY = fontSize * 0.25;
    ctx.fillStyle = photo.captionBg;
    ctx.beginPath();
    roundRect(ctx, centerX - widest / 2 - padX, startY - padY, widest + padX * 2, blockHeight + padY * 2, fontSize * 0.3);
    ctx.fill();
  } else {
    ctx.shadowColor = 'rgba(0, 0, 0, 0.7)';
    ctx.shadowBlur = fontSize * 0.4;
    ctx.shadowOffsetY = Math.max(1, fontSize * 0.06);
  }

  ctx.fillStyle = photo.captionColor || '#FFFFFF';
  lines.forEach((l, idx) => ctx.fillText(l, centerX, startY + idx * lineHeight));
  ctx.restore();
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
  let r = radius;
  if (r > width / 2) r = width / 2;
  if (r > height / 2) r = height / 2;
  if (r < 0) r = 0;
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + width - r, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + r);
  ctx.lineTo(x + width, y + height - r);
  ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
  ctx.lineTo(x + r, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}
