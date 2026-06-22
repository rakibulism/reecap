// Design tool — PNG / SVG export.
//
// Serialises the design document to a standalone SVG (mirroring the canvas
// renderer), inlining raster media as data URIs so the output is portable and
// PNG rasterisation never taints the canvas.

import type { DesignNode } from '../types/design';
import { pointsToPath, smoothPath, arcPath, polygonPoints, starPoints } from './designGeometry';

const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// Fetch a (usually blob:) URL and return a data: URI. Returns '' on failure.
async function toDataUrl(src: string): Promise<string> {
  try {
    const res = await fetch(src);
    const blob = await res.blob();
    return await new Promise((resolve) => {
      const fr = new FileReader();
      fr.onload = () => resolve(String(fr.result));
      fr.onerror = () => resolve('');
      fr.readAsDataURL(blob);
    });
  } catch {
    return '';
  }
}

// Grab the current frame of a live <video> element matching a node's src.
function videoFrame(src: string): string {
  const vid = Array.from(document.querySelectorAll('video')).find((v) => v.src === src || v.currentSrc === src);
  if (!vid || !vid.videoWidth) return '';
  try {
    const c = document.createElement('canvas');
    c.width = vid.videoWidth;
    c.height = vid.videoHeight;
    c.getContext('2d')!.drawImage(vid, 0, 0);
    return c.toDataURL('image/png');
  } catch {
    return '';
  }
}

async function collectMedia(nodes: DesignNode[]): Promise<Record<string, string>> {
  const out: Record<string, string> = {};
  await Promise.all(
    nodes.map(async (n) => {
      if (n.type === 'image' && n.src) out[n.id] = (await toDataUrl(n.src)) || n.src;
      else if (n.type === 'video' && n.src) out[n.id] = videoFrame(n.src);
    }),
  );
  return out;
}

function nodeMarkup(n: DesignNode, media: Record<string, string>): string {
  const { x, y, width: w, height: h, rotation, opacity } = n;
  const fill = n.fill || 'none';
  const stroke = n.stroke ? ` stroke="${n.stroke}" stroke-width="${n.strokeWidth}"` : '';
  const op = opacity !== 1 ? ` opacity="${opacity}"` : '';
  let inner = '';
  switch (n.type) {
    case 'frame':
    case 'rectangle':
      inner = `<rect width="${w}" height="${h}" rx="${n.cornerRadius}" fill="${fill}"${stroke}/>`;
      break;
    case 'ellipse':
      inner = `<ellipse cx="${w / 2}" cy="${h / 2}" rx="${w / 2}" ry="${h / 2}" fill="${fill}"${stroke}/>`;
      break;
    case 'line':
      inner = `<path d="${pointsToPath(n.points ?? [], w, h, false)}" fill="none" stroke="${n.stroke || '#18181B'}" stroke-width="${n.strokeWidth}" stroke-linecap="round"/>`;
      break;
    case 'arrow': {
      const mid = `ar-${n.id}`;
      inner = `<defs><marker id="${mid}" markerWidth="6" markerHeight="6" refX="4.5" refY="3" orient="auto" markerUnits="strokeWidth"><path d="M0,0 L6,3 L0,6 Z" fill="${n.stroke || '#18181B'}"/></marker></defs>` +
        `<path d="${pointsToPath(n.points ?? [], w, h, false)}" fill="none" stroke="${n.stroke || '#18181B'}" stroke-width="${n.strokeWidth}" stroke-linecap="round" marker-end="url(#${mid})"/>`;
      break;
    }
    case 'polygon':
      inner = `<path d="${pointsToPath(n.points ?? polygonPoints(n.sides ?? 6), w, h, true)}" fill="${fill}"${stroke} stroke-linejoin="round"/>`;
      break;
    case 'star':
      inner = `<path d="${pointsToPath(n.points ?? starPoints(n.sides ?? 5, n.innerRatio ?? 0.45), w, h, true)}" fill="${fill}"${stroke} stroke-linejoin="round"/>`;
      break;
    case 'path':
      inner = `<path d="${pointsToPath(n.points ?? [], w, h, !!n.closed)}" fill="${fill}"${stroke} stroke-linejoin="round"/>`;
      break;
    case 'pencil':
      inner = `<path d="${smoothPath(n.points ?? [], w, h)}" fill="none" stroke="${n.stroke || '#18181B'}" stroke-width="${n.strokeWidth}" stroke-linecap="round" stroke-linejoin="round"/>`;
      break;
    case 'text': {
      const size = n.fontSize ?? 40;
      const anchor = n.align === 'center' ? 'middle' : n.align === 'right' ? 'end' : 'start';
      const tx = n.align === 'center' ? w / 2 : n.align === 'right' ? w : 0;
      const tspans = (n.text ?? '').split('\n')
        .map((ln, i) => `<tspan x="${tx}" y="${(size * 0.92 + i * size * 1.2).toFixed(1)}">${esc(ln || ' ')}</tspan>`).join('');
      inner = `<text font-family="${esc(n.fontFamily || 'Inter, sans-serif')}" font-size="${size}" font-weight="${n.fontWeight}" fill="${n.color}" text-anchor="${anchor}" style="letter-spacing:${n.letterSpacing ?? 0}px;white-space:pre">${tspans}</text>`;
      break;
    }
    case 'text-path': {
      const pid = `tp-${n.id}`;
      const anchor = n.align === 'center' ? 'middle' : n.align === 'right' ? 'end' : 'start';
      const so = n.align === 'center' ? '50%' : n.align === 'right' ? '100%' : '0%';
      inner = `<defs><path id="${pid}" d="${arcPath(w, h, n.arc ?? 0)}"/></defs>` +
        `<text font-family="${esc(n.fontFamily || 'Inter, sans-serif')}" font-size="${n.fontSize}" font-weight="${n.fontWeight}" fill="${n.color}" text-anchor="${anchor}"><textPath href="#${pid}" startOffset="${so}">${esc(n.text || '')}</textPath></text>`;
      break;
    }
    case 'image':
    case 'video': {
      const href = media[n.id] || (n.type === 'image' ? n.src : '');
      inner = href
        ? `<image href="${href}" width="${w}" height="${h}" preserveAspectRatio="xMidYMid slice"/>`
        : `<rect width="${w}" height="${h}" fill="#E4E4E7"/>`;
      break;
    }
  }
  return `<g transform="translate(${x} ${y}) rotate(${rotation} ${w / 2} ${h / 2})"${op}>${inner}</g>`;
}

function buildSvg(nodes: DesignNode[], background: string, media: Record<string, string>) {
  const visible = nodes.filter((n) => n.visible);
  const pad = 40;
  let minX = 0, minY = 0, maxX = 800, maxY = 600;
  if (visible.length) {
    minX = Math.min(...visible.map((n) => n.x));
    minY = Math.min(...visible.map((n) => n.y));
    maxX = Math.max(...visible.map((n) => n.x + n.width));
    maxY = Math.max(...visible.map((n) => n.y + n.height));
  }
  const vx = minX - pad, vy = minY - pad;
  const W = Math.max(1, maxX - minX + pad * 2);
  const H = Math.max(1, maxY - minY + pad * 2);
  const bg = background ? `<rect x="${vx}" y="${vy}" width="${W}" height="${H}" fill="${background}"/>` : '';
  const body = visible.map((n) => nodeMarkup(n, media)).join('');
  return { svg: `<svg xmlns="http://www.w3.org/2000/svg" width="${Math.round(W)}" height="${Math.round(H)}" viewBox="${vx} ${vy} ${W} ${H}">${bg}${body}</svg>`, W, H };
}

function download(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function rasterize(svg: string, W: number, H: number, scale = 2): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const url = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
    const img = new Image();
    img.onload = () => {
      const c = document.createElement('canvas');
      c.width = Math.round(W * scale);
      c.height = Math.round(H * scale);
      const ctx = c.getContext('2d')!;
      ctx.drawImage(img, 0, 0, c.width, c.height);
      c.toBlob((b) => (b ? resolve(b) : reject(new Error('toBlob failed'))), 'image/png');
    };
    img.onerror = () => reject(new Error('SVG render failed'));
    img.src = url;
  });
}

export async function exportDesign(format: 'png' | 'svg', nodes: DesignNode[], background: string) {
  const media = await collectMedia(nodes);
  const { svg, W, H } = buildSvg(nodes, background, media);
  if (format === 'svg') {
    download(new Blob([svg], { type: 'image/svg+xml' }), 'reecap-design.svg');
    return;
  }
  const blob = await rasterize(svg, W, H, 2);
  download(blob, 'reecap-design.png');
}
