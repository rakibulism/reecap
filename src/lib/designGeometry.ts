// Design tool — geometry helpers and code generation.
//
// Pure functions shared by the canvas renderer, the hit-testing layer and the
// Dev tool. Nothing here touches the store or React.

import type { DesignNode, Pt } from '../types/design';

export const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

// ---- regular polygon / star points (normalised 0–1 inside the box) ----------

export function polygonPoints(sides: number): Pt[] {
  const n = Math.max(3, Math.round(sides));
  const pts: Pt[] = [];
  for (let i = 0; i < n; i++) {
    const a = -Math.PI / 2 + (i * 2 * Math.PI) / n;
    pts.push({ x: 0.5 + 0.5 * Math.cos(a), y: 0.5 + 0.5 * Math.sin(a) });
  }
  return pts;
}

export function starPoints(points: number, innerRatio: number): Pt[] {
  const n = Math.max(3, Math.round(points));
  const inner = clamp(innerRatio, 0.1, 0.9);
  const pts: Pt[] = [];
  for (let i = 0; i < n * 2; i++) {
    const r = i % 2 === 0 ? 0.5 : 0.5 * inner;
    const a = -Math.PI / 2 + (i * Math.PI) / n;
    pts.push({ x: 0.5 + r * Math.cos(a), y: 0.5 + r * Math.sin(a) });
  }
  return pts;
}

// ---- normalised points → world-space path "d" --------------------------------

// Map a normalised point into the node's local box (0,0)-(w,h).
const local = (p: Pt, w: number, h: number) => ({ x: p.x * w, y: p.y * h });

export function pointsToPath(points: Pt[], w: number, h: number, closed: boolean): string {
  if (!points.length) return '';
  const pts = points.map((p) => local(p, w, h));
  let d = `M ${pts[0].x.toFixed(2)} ${pts[0].y.toFixed(2)}`;
  for (let i = 1; i < pts.length; i++) d += ` L ${pts[i].x.toFixed(2)} ${pts[i].y.toFixed(2)}`;
  if (closed) d += ' Z';
  return d;
}

// Smooth freehand (pencil) stroke through points using a Catmull-Rom → Bézier
// conversion, so the captured pointer samples render as a flowing line.
export function smoothPath(points: Pt[], w: number, h: number): string {
  if (points.length < 2) return pointsToPath(points, w, h, false);
  const p = points.map((q) => local(q, w, h));
  let d = `M ${p[0].x.toFixed(2)} ${p[0].y.toFixed(2)}`;
  for (let i = 0; i < p.length - 1; i++) {
    const p0 = p[i - 1] ?? p[i];
    const p1 = p[i];
    const p2 = p[i + 1];
    const p3 = p[i + 2] ?? p2;
    const c1x = p1.x + (p2.x - p0.x) / 6;
    const c1y = p1.y + (p2.y - p0.y) / 6;
    const c2x = p2.x - (p3.x - p1.x) / 6;
    const c2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C ${c1x.toFixed(2)} ${c1y.toFixed(2)} ${c2x.toFixed(2)} ${c2y.toFixed(2)} ${p2.x.toFixed(2)} ${p2.y.toFixed(2)}`;
  }
  return d;
}

// Arc baseline for text-on-path. `arc` in -1…1 bends the baseline up/down; 0 is
// a straight line across the box. Returns a path spanning the node width.
export function arcPath(w: number, h: number, arc: number): string {
  const a = clamp(arc, -1, 1);
  const y = h / 2;
  if (Math.abs(a) < 0.001) return `M 0 ${y.toFixed(2)} L ${w.toFixed(2)} ${y.toFixed(2)}`;
  // Control point bulges by up to ~80% of the half-height.
  const bulge = -a * h * 0.8;
  return `M 0 ${y.toFixed(2)} Q ${(w / 2).toFixed(2)} ${(y + bulge).toFixed(2)} ${w.toFixed(2)} ${y.toFixed(2)}`;
}

// ---- bounding box of an arbitrary world-space point cloud --------------------

export function bboxOf(points: { x: number; y: number }[]) {
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const p of points) {
    minX = Math.min(minX, p.x);
    minY = Math.min(minY, p.y);
    maxX = Math.max(maxX, p.x);
    maxY = Math.max(maxY, p.y);
  }
  if (!points.length) return { x: 0, y: 0, width: 0, height: 0 };
  return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
}

// Normalise a cloud of world points into {x,y,width,height} + 0–1 points,
// padding zero-size dimensions so divisions stay finite.
export function normalisePoints(world: { x: number; y: number }[]) {
  const bb = bboxOf(world);
  const w = bb.width || 1;
  const h = bb.height || 1;
  const points: Pt[] = world.map((p) => ({ x: (p.x - bb.x) / w, y: (p.y - bb.y) / h }));
  return { x: bb.x, y: bb.y, width: w, height: h, points };
}

// ---- Dev tool: node → CSS / SVG snippets -------------------------------------

const css = (k: string, v: string | number) => `  ${k}: ${v};`;

export function nodeToCss(n: DesignNode): string {
  const lines: string[] = [`.${cssName(n)} {`, css('position', 'absolute')];
  lines.push(css('left', `${Math.round(n.x)}px`));
  lines.push(css('top', `${Math.round(n.y)}px`));
  lines.push(css('width', `${Math.round(n.width)}px`));
  lines.push(css('height', `${Math.round(n.height)}px`));
  if (n.rotation) lines.push(css('transform', `rotate(${n.rotation}deg)`));
  if (n.opacity !== 1) lines.push(css('opacity', n.opacity));
  if (n.type === 'text' || n.type === 'text-path') {
    lines.push(css('font-family', n.fontFamily ?? 'Inter, sans-serif'));
    lines.push(css('font-size', `${n.fontSize ?? 32}px`));
    lines.push(css('font-weight', n.fontWeight ?? 600));
    lines.push(css('color', n.color ?? '#111111'));
    lines.push(css('text-align', n.align ?? 'left'));
    if (n.letterSpacing) lines.push(css('letter-spacing', `${n.letterSpacing}px`));
  } else {
    if (n.fill) lines.push(css('background', n.fill));
    if (n.cornerRadius) lines.push(css('border-radius', `${n.cornerRadius}px`));
  }
  if (n.stroke && n.strokeWidth) lines.push(css('border', `${n.strokeWidth}px solid ${n.stroke}`));
  lines.push('}');
  return lines.join('\n');
}

export function cssName(n: DesignNode): string {
  return (n.name || n.type).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || n.type;
}
