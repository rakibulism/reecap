// Post-build prerender: bakes each blog post into static HTML (so AI crawlers
// and search engines see the content without running JS), and generates
// sitemap.xml + llms.txt. Runs after `vite build`. No dependencies.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dist = join(root, 'dist');
const SITE = 'https://reecap.vercel.app';

const posts = JSON.parse(readFileSync(join(root, 'src/data/blog-posts.json'), 'utf8'));
const template = readFileSync(join(dist, 'index.html'), 'utf8');

const esc = (s = '') => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const escAttr = (s = '') => esc(s).replace(/"/g, '&quot;');

// --- head + #prerender injection -------------------------------------------
function page({ title, description, canonical, type = 'website', jsonLd, bodyHtml }) {
  let html = template;
  html = html.replace(/<title>[\s\S]*?<\/title>/, `<title>${esc(title)}</title>`);
  html = html.replace(/(<meta name="description" content=")[^"]*(")/, `$1${escAttr(description)}$2`);
  html = html.replace(/(<meta property="og:title" content=")[^"]*(")/, `$1${escAttr(title)}$2`);
  html = html.replace(/(<meta property="og:description" content=")[^"]*(")/, `$1${escAttr(description)}$2`);
  html = html.replace(/(<meta property="og:url" content=")[^"]*(")/, `$1${escAttr(canonical)}$2`);
  html = html.replace(/(<meta property="og:type" content=")[^"]*(")/, `$1${type}$2`);
  html = html.replace(/(<meta name="twitter:title" content=")[^"]*(")/, `$1${escAttr(title)}$2`);
  html = html.replace(/(<meta name="twitter:description" content=")[^"]*(")/, `$1${escAttr(description)}$2`);
  html = html.replace(/(<link rel="canonical" href=")[^"]*(")/, `$1${escAttr(canonical)}$2`);
  if (jsonLd) {
    const ld = `<script type="application/ld+json">${JSON.stringify(jsonLd)}</script>`;
    html = html.replace('</head>', `${ld}</head>`);
  }
  html = html.replace('<div id="root"></div>', `<div id="prerender">${bodyHtml}</div><div id="root"></div>`);
  return html;
}

function write(routePath, html) {
  const dir = join(dist, routePath);
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, 'index.html'), html);
}

// --- blog posts ------------------------------------------------------------
const fmtDate = (iso) => new Date(iso + 'T00:00:00').toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

for (const p of posts) {
  const url = `${SITE}/blog/${p.slug}`;
  const bodyBlocks = p.body
    .map((b) => {
      if (b.type === 'h2') return `<h2>${esc(b.text)}</h2>`;
      if (b.type === 'ul') return `<ul>${b.items.map((i) => `<li>${esc(i)}</li>`).join('')}</ul>`;
      return `<p>${esc(b.text)}</p>`;
    })
    .join('');
  const faqBlocks = p.faq.map((f) => `<div><h3>${esc(f.q)}</h3><p>${esc(f.a)}</p></div>`).join('');
  const bodyHtml =
    `<article><p>${esc(p.category)} · ${fmtDate(p.date)} · ${esc(p.readingTime)}</p>` +
    `<h1>${esc(p.title)}</h1><p>By ${esc(p.author)}</p>${bodyBlocks}` +
    `<section><h2>Frequently asked questions</h2>${faqBlocks}</section>` +
    `<p><a href="/app">Open the Reecap editor</a></p></article>`;

  const jsonLd = [
    {
      '@context': 'https://schema.org', '@type': 'Article',
      headline: p.title, description: p.description,
      datePublished: p.date, dateModified: p.updated,
      author: { '@type': 'Person', name: p.author },
      publisher: { '@type': 'Organization', name: 'Reecap', url: SITE },
      mainEntityOfPage: url, keywords: p.keywords.join(', '),
    },
    {
      '@context': 'https://schema.org', '@type': 'FAQPage',
      mainEntity: p.faq.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
    },
  ];

  write(`blog/${p.slug}`, page({ title: `${p.title} | Reecap`, description: p.description, canonical: url, type: 'article', jsonLd, bodyHtml }));
}

// --- blog index ------------------------------------------------------------
const listHtml =
  `<h1>Reecap Blog — turn photos into video</h1><ul>` +
  posts.map((p) => `<li><a href="/blog/${p.slug}">${esc(p.title)}</a> — ${esc(p.excerpt)}</li>`).join('') +
  `</ul>`;
write('blog', page({
  title: 'Blog — Photo & Video Recap Tips | Reecap',
  description: 'Guides and tutorials on turning photos into videos — slideshows, Reels, transitions, captions, and exporting MP4s, all in your browser.',
  canonical: `${SITE}/blog`, bodyHtml: listHtml,
}));

// --- sitemap.xml -----------------------------------------------------------
const staticRoutes = ['/', '/docs', '/updates', '/blog'];
const urls = [
  ...staticRoutes.map((r) => ({ loc: SITE + r, lastmod: '2026-06-21' })),
  ...posts.map((p) => ({ loc: `${SITE}/blog/${p.slug}`, lastmod: p.updated })),
];
const sitemap =
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
  urls.map((u) => `  <url><loc>${u.loc}</loc><lastmod>${u.lastmod}</lastmod></url>`).join('\n') +
  `\n</urlset>\n`;
writeFileSync(join(dist, 'sitemap.xml'), sitemap);

// --- llms.txt --------------------------------------------------------------
const llms =
  `# Reecap\n` +
  `> Reecap is a free, open-source, browser-based editor that turns your photos into a cinematic video recap (MP4). It runs 100% client-side — no upload, no account.\n\n` +
  `## Key pages\n` +
  `- [Home](${SITE}/): Product overview and features.\n` +
  `- [Editor](${SITE}/app): The web app where you build and export recaps.\n` +
  `- [Docs](${SITE}/docs): How to use Reecap.\n` +
  `- [Updates](${SITE}/updates): Changelog.\n` +
  `- [Blog](${SITE}/blog): Guides and tutorials.\n\n` +
  `## Key facts\n` +
  `- Free and open source; exports watermark-free MP4s.\n` +
  `- Supports 2–30 photos, 8 transition styles, captions with animation, background music.\n` +
  `- Whole-video speed control from 0.5× to 10×; audio stays at natural pitch.\n` +
  `- Aspect ratios: 16:9, 9:16, 1:1, 4:3, 5:4; 720p or 1080p MP4 export via WebCodecs.\n` +
  `- 100% client-side — photos are never uploaded.\n\n` +
  `## Blog posts\n` +
  posts.map((p) => `- [${p.title}](${SITE}/blog/${p.slug}): ${p.description}`).join('\n') +
  `\n`;
writeFileSync(join(dist, 'llms.txt'), llms);

console.log(`prerendered ${posts.length} posts + blog index, sitemap.xml, llms.txt`);
