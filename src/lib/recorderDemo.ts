// Screen Recorder — synthetic demo clip.
//
// Generates a short, self-contained sample recording by animating a mock app
// UI on a canvas and capturing it to a webm Blob. No network needed, and the
// result is a same-origin blob so the click-zoom preview AND export both work.

export interface DemoResult {
  url: string;
  width: number;
  height: number;
  duration: number;
  clicks: { t: number; x: number; y: number }[];
}

const W = 1280;
const H = 720;
const DURATION = 6; // seconds

// Scripted clicks (time + normalised position) on the mock UI tiles.
const SCRIPT = [
  { t: 1.0, x: 0.24, y: 0.40 },
  { t: 2.6, x: 0.72, y: 0.34 },
  { t: 4.0, x: 0.30, y: 0.74 },
  { t: 5.1, x: 0.76, y: 0.72 },
];

const TILES = [
  { x: 0.24, y: 0.40, c: '#6366f1', n: '1' },
  { x: 0.72, y: 0.34, c: '#ec4899', n: '2' },
  { x: 0.30, y: 0.74, c: '#10b981', n: '3' },
  { x: 0.76, y: 0.72, c: '#f59e0b', n: '4' },
];

function cursorPos(t: number) {
  // Move from the previous target to the next, easing in over ~0.8s before each click.
  let prev = { x: 0.5, y: 0.55, t: 0 };
  let next = SCRIPT[0];
  for (let i = 0; i < SCRIPT.length; i++) {
    if (t >= SCRIPT[i].t) { prev = SCRIPT[i]; next = SCRIPT[i + 1] ?? SCRIPT[i]; }
  }
  const span = Math.max(0.001, next.t - prev.t);
  const k = Math.max(0, Math.min(1, (t - prev.t) / span));
  const e = k * k * (3 - 2 * k);
  return { x: prev.x + (next.x - prev.x) * e, y: prev.y + (next.y - prev.y) * e };
}

function drawScene(ctx: CanvasRenderingContext2D, t: number) {
  // backdrop
  ctx.fillStyle = '#0b1220';
  ctx.fillRect(0, 0, W, H);
  // window card
  const m = 60;
  ctx.fillStyle = '#f8fafc';
  roundRect(ctx, m, m, W - m * 2, H - m * 2, 18);
  ctx.fill();
  // title bar
  ctx.fillStyle = '#e2e8f0';
  roundRect(ctx, m, m, W - m * 2, 48, 18);
  ctx.fill();
  ctx.fillStyle = '#fff';
  ctx.fillRect(m, m + 36, W - m * 2, 12);
  ['#ef4444', '#f59e0b', '#22c55e'].forEach((c, i) => { ctx.fillStyle = c; circle(ctx, m + 24 + i * 22, m + 24, 6); });
  ctx.fillStyle = '#475569';
  ctx.font = '600 16px Inter, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('reecap.app — your dashboard', W / 2, m + 30);

  // tiles
  for (const tile of TILES) {
    const cx = tile.x * W, cy = tile.y * H, tw = 280, th = 150;
    ctx.fillStyle = tile.c;
    roundRect(ctx, cx - tw / 2, cy - th / 2, tw, th, 16);
    ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    ctx.font = '700 64px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(tile.n, cx, cy);
    ctx.textBaseline = 'alphabetic';
  }

  // click ripples
  for (const s of SCRIPT) {
    const age = t - s.t;
    if (age >= 0 && age < 0.6) {
      const r = 10 + age * 120;
      ctx.strokeStyle = `rgba(59,130,246,${1 - age / 0.6})`;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(s.x * W, s.y * H, r, 0, Math.PI * 2);
      ctx.stroke();
    }
  }

  // cursor
  const cur = cursorPos(t);
  const px = cur.x * W, py = cur.y * H;
  ctx.fillStyle = '#0b1220';
  ctx.strokeStyle = '#fff';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(px, py);
  ctx.lineTo(px, py + 22);
  ctx.lineTo(px + 6, py + 16);
  ctx.lineTo(px + 14, py + 22);
  ctx.lineTo(px + 8, py + 12);
  ctx.lineTo(px + 18, py + 12);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}
function circle(ctx: CanvasRenderingContext2D, x: number, y: number, r: number) {
  ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
}

export async function buildDemoClip(onProgress?: (p: number) => void): Promise<DemoResult> {
  const canvas = document.createElement('canvas');
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext('2d')!;
  const stream = canvas.captureStream(30);
  const mime = MediaRecorder.isTypeSupported('video/webm;codecs=vp9') ? 'video/webm;codecs=vp9' : 'video/webm';
  const rec = new MediaRecorder(stream, { mimeType: mime });
  const chunks: Blob[] = [];
  rec.ondataavailable = (e) => e.data.size && chunks.push(e.data);
  const stopped = new Promise<void>((res) => { rec.onstop = () => res(); });

  rec.start();
  const start = performance.now();
  // A timer pump (not rAF) so the capture still runs in a hidden/background tab.
  await new Promise<void>((resolve) => {
    const tick = () => {
      const t = (performance.now() - start) / 1000;
      drawScene(ctx, t);
      onProgress?.(Math.min(1, t / DURATION));
      if (t < DURATION) setTimeout(tick, 33);
      else { rec.stop(); resolve(); }
    };
    tick();
  });
  await stopped;

  const blob = new Blob(chunks, { type: 'video/webm' });
  return { url: URL.createObjectURL(blob), width: W, height: H, duration: DURATION, clicks: SCRIPT };
}
