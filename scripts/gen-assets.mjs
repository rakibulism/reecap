// One-off asset generator. Run with: npm i -D sharp && node scripts/gen-assets.mjs
// Produces the Reecap favicon, PWA icons, apple-touch-icon, and OG/social image.
import sharp from 'sharp';
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const pub = join(dirname(fileURLToPath(import.meta.url)), '..', 'public');

// Brand color #FF3D03, with a slightly darker stop for depth on the app tile.
const BRAND = '#FF3D03';
const BRAND_DARK = '#E63100';
const GRAD = `<linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
  <stop offset="0%" stop-color="${BRAND}"/><stop offset="100%" stop-color="${BRAND_DARK}"/>
</linearGradient>`;

// Filmstrip + play mark. `rounded` adds the app-tile corner radius.
const mark = (size, rounded = true) => {
  const r = rounded ? 116 : 0;
  // sprocket holes along the top/bottom of the white film cell
  const holes = (y) =>
    [122, 178, 234, 290, 346]
      .map((x) => `<rect x="${x}" y="${y}" width="26" height="22" rx="6"/>`)
      .join('');
  return `<svg width="${size}" height="${size}" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <defs>${GRAD}</defs>
  <rect width="512" height="512" rx="${r}" fill="url(#g)"/>
  <rect x="96" y="150" width="320" height="212" rx="34" fill="#ffffff"/>
  <g fill="url(#g)">${holes(164)}${holes(326)}</g>
  <path d="M214 202 L214 310 L312 256 Z" fill="url(#g)"/>
</svg>`;
};

// Maskable: full-bleed gradient, mark kept inside the safe area (~62%).
const maskable = `<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <defs>${GRAD}</defs>
  <rect width="512" height="512" fill="url(#g)"/>
  <g transform="translate(106 106) scale(0.585)">
    <rect x="96" y="150" width="320" height="212" rx="34" fill="#ffffff"/>
    <path d="M214 202 L214 310 L312 256 Z" fill="#FF3D03"/>
  </g>
</svg>`;

const OG = `<svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
  <defs>
    ${GRAD}
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#0c1224"/><stop offset="100%" stop-color="#080810"/>
    </linearGradient>
    <radialGradient id="glow" cx="22%" cy="8%" r="60%">
      <stop offset="0%" stop-color="#FF3D03" stop-opacity="0.45"/>
      <stop offset="100%" stop-color="#FF3D03" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="c1" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fb7185"/><stop offset="1" stop-color="#f97316"/></linearGradient>
    <linearGradient id="c2" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#38bdf8"/><stop offset="1" stop-color="#6366f1"/></linearGradient>
    <linearGradient id="c3" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#a78bfa"/><stop offset="1" stop-color="#e879f9"/></linearGradient>
    <style>text{font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;}</style>
  </defs>
  <rect width="1200" height="630" fill="url(#bg)"/>
  <rect width="1200" height="630" fill="url(#glow)"/>

  <!-- decorative cards -->
  <g transform="translate(820 120)">
    <rect x="0" y="40" width="150" height="270" rx="20" fill="url(#c1)" transform="rotate(-6 75 175)"/>
    <rect x="170" y="0" width="200" height="200" rx="20" fill="url(#c2)" transform="rotate(4 270 100)"/>
    <rect x="150" y="230" width="200" height="200" rx="20" fill="url(#c3)" transform="rotate(-3 250 330)"/>
  </g>

  <!-- logo + wordmark -->
  <g transform="translate(80 70)">
    <rect width="64" height="64" rx="16" fill="url(#g)"/>
    <g transform="scale(0.125)"><rect x="96" y="150" width="320" height="212" rx="34" fill="#fff"/><path d="M214 202 L214 310 L312 256 Z" fill="#FF3D03"/></g>
    <text x="82" y="44" font-size="34" font-weight="700" fill="#ffffff">Reecap</text>
  </g>

  <!-- headline -->
  <text x="80" y="300" font-size="68" font-weight="800" fill="#ffffff">Turn your photos into</text>
  <text x="80" y="380" font-size="68" font-weight="800" fill="#FF8A5C">a cinematic recap</text>

  <!-- subtext -->
  <text x="80" y="448" font-size="27" font-weight="400" fill="#9aa3b8">Free, browser-based video recap editor — transitions,</text>
  <text x="80" y="486" font-size="27" font-weight="400" fill="#9aa3b8">captions, music, and a real MP4 export.</text>

  <!-- url -->
  <text x="80" y="565" font-size="24" font-weight="700" fill="#5b6478">reecap.vercel.app</text>
</svg>`;

const png = (svg, size, name) =>
  sharp(Buffer.from(svg)).resize(size, size).png().toFile(join(pub, name));

await Promise.all([
  png(mark(512), 512, 'icon-512.png'),
  png(mark(512), 192, 'icon-192.png'),
  png(maskable, 512, 'icon-maskable-512.png'),
  png(mark(512, false), 180, 'apple-touch-icon.png'),
  sharp(Buffer.from(OG)).png().toFile(join(pub, 'og-image.png')),
]);

writeFileSync(join(pub, 'favicon.svg'), mark(512).trim());
console.log('assets written to public/');
