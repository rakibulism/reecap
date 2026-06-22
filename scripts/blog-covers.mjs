// Generates an on-brand SVG cover image for every blog post into
// public/blog/covers/<slug>.svg. The gradient is derived from each post's
// `cover` tailwind classes; the image doubles as the post's Open Graph image.
//
// Run standalone (`node scripts/blog-covers.mjs`) or as part of `npm run build`.

import { readFileSync, writeFileSync, mkdirSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const DATA_DIR = join(ROOT, 'src', 'data');
const OUT_DIR = join(ROOT, 'public', 'blog', 'covers');

// All batched post files: blog-posts.json, blog-posts-2.json, …
const loadPosts = () =>
  readdirSync(DATA_DIR)
    .filter((f) => /^blog-posts.*\.json$/.test(f))
    .flatMap((f) => JSON.parse(readFileSync(join(DATA_DIR, f), 'utf8')));

// Tailwind palette (subset of shades used across posts, plus common fallbacks).
const TW = {
  'slate-300': '#cbd5e1', 'slate-500': '#64748b', 'slate-600': '#475569', 'slate-700': '#334155',
  'gray-400': '#9ca3af', 'gray-500': '#6b7280', 'gray-600': '#4b5563', 'gray-700': '#374151',
  'zinc-600': '#52525b', 'zinc-700': '#3f3f46',
  'red-400': '#f87171', 'red-500': '#ef4444', 'red-600': '#dc2626',
  'orange-400': '#fb923c', 'orange-500': '#f97316', 'orange-600': '#ea580c',
  'amber-400': '#fbbf24', 'amber-500': '#f59e0b', 'amber-600': '#d97706',
  'yellow-400': '#facc15', 'yellow-500': '#eab308',
  'lime-500': '#84cc16',
  'green-500': '#22c55e', 'green-600': '#16a34a',
  'emerald-400': '#34d399', 'emerald-500': '#10b981', 'emerald-600': '#059669',
  'teal-400': '#2dd4bf', 'teal-500': '#14b8a6', 'teal-600': '#0d9488', 'teal-700': '#0f766e',
  'cyan-400': '#22d3ee', 'cyan-500': '#06b6d4', 'cyan-600': '#0891b2',
  'sky-400': '#38bdf8', 'sky-500': '#0ea5e9', 'sky-600': '#0284c7',
  'blue-400': '#60a5fa', 'blue-500': '#3b82f6', 'blue-600': '#2563eb',
  'indigo-400': '#818cf8', 'indigo-500': '#6366f1', 'indigo-600': '#4f46e5',
  'violet-400': '#a78bfa', 'violet-500': '#8b5cf6', 'violet-600': '#7c3aed',
  'purple-500': '#a855f7', 'purple-600': '#9333ea', 'purple-700': '#7e22ce',
  'fuchsia-400': '#e879f9', 'fuchsia-500': '#d946ef', 'fuchsia-600': '#c026d3',
  'pink-400': '#f472b6', 'pink-500': '#ec4899', 'pink-600': '#db2777',
  'rose-300': '#fda4af', 'rose-400': '#fb7185', 'rose-500': '#f43f5e', 'rose-600': '#e11d48',
};

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// Deterministic fallback color from a string (so unknown tokens still vary).
function hashHue(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) % 360;
  return h;
}

function stops(cover, slug) {
  const toks = (cover || '').split(/\s+/);
  const pick = (prefix) => {
    const t = toks.find((x) => x.startsWith(prefix + '-'));
    return t ? TW[t.slice(prefix.length + 1)] : null;
  };
  let from = pick('from');
  let via = pick('via');
  let to = pick('to');
  if (!from || !to) {
    // Fallback: derive a pleasant gradient from the slug hue.
    const hue = hashHue(slug);
    from = `hsl(${hue} 70% 55%)`;
    via = via || `hsl(${(hue + 25) % 360} 70% 50%)`;
    to = `hsl(${(hue + 55) % 360} 70% 45%)`;
  }
  return [from, via || from, to];
}

// Wrap a title into lines of at most `max` characters (word-aware).
function wrap(title, max, maxLines) {
  const words = title.split(/\s+/);
  const lines = [];
  let line = '';
  for (const w of words) {
    if ((line + ' ' + w).trim().length <= max) {
      line = (line + ' ' + w).trim();
    } else {
      if (line) lines.push(line);
      line = w;
    }
    if (lines.length === maxLines) break;
  }
  if (line && lines.length < maxLines) lines.push(line);
  if (lines.length === maxLines) {
    const last = lines[maxLines - 1];
    if (last.length > max - 1 && title.length > lines.join(' ').length) {
      lines[maxLines - 1] = last.slice(0, max - 1).replace(/\s+\S*$/, '') + '…';
    }
  }
  return lines;
}

function svg(post) {
  const [from, via, to] = stops(post.cover, post.slug);
  const titleLines = wrap(post.title, 26, 4);
  const fontSize = titleLines.length >= 4 ? 58 : titleLines.length === 3 ? 64 : 72;
  const startY = 360 - ((titleLines.length - 1) * fontSize) / 2;
  const titleTspans = titleLines
    .map((ln, i) => `<tspan x="72" y="${Math.round(startY + i * (fontSize + 8))}">${esc(ln)}</tspan>`)
    .join('');

  // Decorative translucent circles seeded by the slug.
  const h = hashHue(post.slug);
  const circles = [
    `<circle cx="1020" cy="120" r="220" fill="#fff" opacity="0.07" />`,
    `<circle cx="1140" cy="${260 + (h % 80)}" r="120" fill="#fff" opacity="0.06" />`,
    `<circle cx="${860 + (h % 60)}" cy="560" r="90" fill="#000" opacity="0.08" />`,
  ].join('');

  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630" role="img" aria-label="${esc(post.title)}">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${from}"/>
      <stop offset="0.5" stop-color="${via}"/>
      <stop offset="1" stop-color="${to}"/>
    </linearGradient>
    <linearGradient id="shade" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0.35" stop-color="#000" stop-opacity="0"/>
      <stop offset="1" stop-color="#000" stop-opacity="0.45"/>
    </linearGradient>
    <pattern id="dots" width="28" height="28" patternUnits="userSpaceOnUse">
      <circle cx="2" cy="2" r="1.5" fill="#fff" opacity="0.10"/>
    </pattern>
  </defs>
  <rect width="1200" height="630" fill="url(#g)"/>
  <rect width="1200" height="630" fill="url(#dots)"/>
  ${circles}
  <rect width="1200" height="630" fill="url(#shade)"/>
  <g font-family="Inter, system-ui, -apple-system, Segoe UI, Roboto, sans-serif">
    <g transform="translate(72,84)">
      <rect x="0" y="0" rx="16" ry="16" width="${Math.max(120, esc(post.category).length * 12 + 36)}" height="36" fill="#ffffff" opacity="0.18"/>
      <text x="18" y="24" font-size="16" font-weight="700" letter-spacing="1.5" fill="#fff" style="text-transform:uppercase">${esc((post.category || 'Guide').toUpperCase())}</text>
    </g>
    <text font-size="${fontSize}" font-weight="800" fill="#ffffff" letter-spacing="-1">${titleTspans}</text>
    <g transform="translate(72,556)" fill="#ffffff">
      <circle cx="11" cy="-5" r="11" fill="#ffffff" opacity="0.95"/>
      <circle cx="11" cy="-5" r="5" fill="${to}"/>
      <text x="34" y="0" font-size="22" font-weight="800" letter-spacing="-0.3">Reecap</text>
      <text x="135" y="0" font-size="18" font-weight="500" opacity="0.8">· ${esc(post.readingTime || '')}</text>
    </g>
  </g>
</svg>`;
}

const posts = loadPosts();
mkdirSync(OUT_DIR, { recursive: true });
let n = 0;
for (const post of posts) {
  writeFileSync(join(OUT_DIR, `${post.slug}.svg`), svg(post));
  n++;
}
console.log(`generated ${n} blog covers → public/blog/covers/`);
