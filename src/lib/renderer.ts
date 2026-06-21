import { type Photo, type ReecapSettings } from '../types';

/**
 * Renders a single frame of a photo onto a canvas with the given settings.
 */
export async function renderFrame(
  canvas: HTMLCanvasElement,
  photo: Photo,
  settings: ReecapSettings,
  dimensions: { width: number; height: number }
): Promise<void> {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const { width, height } = dimensions;
  canvas.width = width;
  canvas.height = height;

  // 1. Draw Background
  if (settings.backgroundMode === 'slide') {
    // Draw blurred photo
    const blurAmount = settings.backgroundBlur;
    ctx.filter = `blur(${blurAmount}px)`;
    
    // Calculate cover fit for background
    const bgScale = Math.max(width / photo.width, height / photo.height);
    const bgW = photo.width * bgScale;
    const bgH = photo.height * bgScale;
    const bgX = (width - bgW) / 2;
    const bgY = (height - bgH) / 2;
    
    const img = await loadImage(photo.objectUrl);
    ctx.drawImage(img, bgX - blurAmount, bgY - blurAmount, bgW + blurAmount * 2, bgH + blurAmount * 2);
    
    // Reset filter for overlay and foreground
    ctx.filter = 'none';
    
    // Apply black overlay
    ctx.fillStyle = `rgba(0, 0, 0, ${settings.backgroundOverlay / 100})`;
    ctx.fillRect(0, 0, width, height);
  } else if (settings.backgroundMode === 'color') {
    ctx.fillStyle = settings.backgroundColor;
    ctx.fillRect(0, 0, width, height);
  } else {
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, width, height);
  }

  // 2. Draw Foreground Photo
  const padding = settings.padding;
  const frameW = width - padding * 2;
  const frameH = height - padding * 2;

  // Calculate fit
  let drawW, drawH, drawX, drawY;
  const img = await loadImage(photo.objectUrl);

  if (settings.imageFit === 'cover') {
    const scale = Math.max(frameW / photo.width, frameH / photo.height);
    drawW = photo.width * scale;
    drawH = photo.height * scale;
  } else {
    // contain
    const scale = Math.min(frameW / photo.width, frameH / photo.height);
    drawW = photo.width * scale;
    drawH = photo.height * scale;
  }

  drawX = padding + (frameW - drawW) / 2;
  drawY = padding + (frameH - drawH) / 2;

  // 3. Apply Shadow and Border Radius
  ctx.save();
  
  // Clip for border radius
  if (settings.borderRadius > 0) {
    ctx.beginPath();
    roundRect(ctx, drawX, drawY, drawW, drawH, settings.borderRadius);
    ctx.clip();
  }

  // Draw shadow (behind the image, so we do it before drawing the image but after clipping or using a shadow property)
  // Actually, standard canvas shadow happens when drawing.
  if (settings.shadow > 0) {
    ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
    ctx.shadowBlur = settings.shadow;
    ctx.shadowOffsetY = settings.shadow / 2;
  }

  ctx.drawImage(img, drawX, drawY, drawW, drawH);
  ctx.restore();

  // 4. Draw caption overlay (if any).
  // Position relative to the VISIBLE frame, mirroring the preview: for 'cover'
  // the image overflows the padded frame (drawW/H oversized, drawX/Y negative),
  // so captions must use the padded frame rect, not the off-screen image rect.
  if (photo.caption && photo.caption.trim()) {
    const captionRect = settings.imageFit === 'cover'
      ? { x: padding, y: padding, w: frameW, h: frameH }
      : { x: drawX, y: drawY, w: drawW, h: drawH };
    drawCaption(ctx, photo.caption.trim(), photo.captionPosition || 'bottom', captionRect, {
      color: photo.captionColor || '#FFFFFF',
      bg: photo.captionBg,
    });
  }
}

/**
 * Draws a centered, word-wrapped caption over the photo rect. Optionally fills a
 * rounded pill behind the text; otherwise uses a soft shadow for legibility.
 */
function drawCaption(
  ctx: CanvasRenderingContext2D,
  text: string,
  position: 'top' | 'center' | 'bottom',
  rect: { x: number; y: number; w: number; h: number },
  style: { color: string; bg?: string }
) {
  const fontSize = Math.max(16, Math.round(rect.h * 0.05));
  const lineHeight = fontSize * 1.25;
  const maxWidth = rect.w * 0.88;
  const margin = rect.h * 0.06;

  ctx.save();
  ctx.font = `600 ${fontSize}px Inter, system-ui, -apple-system, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';

  // Word-wrap into lines that fit maxWidth.
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
  const centerX = rect.x + rect.w / 2;
  let startY: number;
  if (position === 'top') {
    startY = rect.y + margin;
  } else if (position === 'center') {
    startY = rect.y + (rect.h - blockHeight) / 2;
  } else {
    startY = rect.y + rect.h - margin - blockHeight;
  }

  // Optional pill background behind the text block.
  if (style.bg) {
    const widest = Math.min(maxWidth, Math.max(...lines.map((l) => ctx.measureText(l).width)));
    const padX = fontSize * 0.5;
    const padY = fontSize * 0.25;
    const boxW = widest + padX * 2;
    const boxH = blockHeight + padY * 2;
    const boxX = centerX - boxW / 2;
    const boxY = startY - padY;
    ctx.fillStyle = style.bg;
    ctx.beginPath();
    roundRect(ctx, boxX, boxY, boxW, boxH, fontSize * 0.3);
    ctx.fill();
  } else {
    ctx.shadowColor = 'rgba(0, 0, 0, 0.7)';
    ctx.shadowBlur = fontSize * 0.4;
    ctx.shadowOffsetY = Math.max(1, fontSize * 0.06);
  }

  ctx.fillStyle = style.color;
  lines.forEach((l, i) => {
    ctx.fillText(l, centerX, startY + i * lineHeight);
  });

  ctx.restore();
}

/**
 * Helper to load an image from a URL
 */
function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
}

/**
 * Helper to draw a rounded rectangle
 */
function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
  if (radius > width / 2) radius = width / 2;
  if (radius > height / 2) radius = height / 2;
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}
