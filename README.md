# Reecap

**Your week. In motion.**

Turn your work photos into a shareable video recap. No timeline, no editor. Upload → adjust → export.

![License](https://img.shields.io/badge/license-MIT-black) ![Status](https://img.shields.io/badge/status-v1--in--progress-black) ![Stack](https://img.shields.io/badge/stack-React%20%2B%20TypeScript-black)

---

## What it does

Reecap takes a batch of your screenshots, design previews, or progress photos and renders them into a smooth animated MP4 — entirely in your browser. No account, no server, no waiting.

Built for designers and developers who have great work to show but no time to animate it.

```
Upload photos (2–30) → Customize layout & motion → Export MP4
```

---

## Features

- **Photo upload** — drag-and-drop or browse, JPG/PNG/WebP, up to 30 photos
- **Reorder** — drag to rearrange the slide sequence
- **Aspect ratios** — 16:9, 4:3, 5:4, 1:1, 9:16
- **Slide duration** — adjustable per-slide timing (0.2s – 5.0s)
- **Transition styles** — Fade, Slide, Zoom, or None
- **Layout controls** — padding, border radius, drop shadow
- **Background modes** — solid color, custom image, or blurred slide (with blur + overlay sliders)
- **Image fit** — Cover or Contain
- **Export quality** — 720p (1×) or 1080p (2×)
- **Dark mode** — full light/dark toggle, persisted to localStorage
- **100% client-side** — no uploads, no backend, no data leaves your browser

---

## Tech stack

| Layer | Technology |
|---|---|
| Framework | React 18 + TypeScript |
| Build | Vite |
| Styling | Tailwind CSS + CSS custom properties |
| State | Zustand |
| Video encoding | FFmpeg WASM (`@ffmpeg/ffmpeg`) |
| Canvas rendering | HTML5 Canvas API |
| Drag & drop | `@dnd-kit/core` + `@dnd-kit/sortable` |
| Icons | Phosphor Icons |

---

## Getting started

### Prerequisites

- Node.js 18+
- npm or pnpm

### Install & run

```bash
git clone https://github.com/yourusername/reecap.git
cd reecap
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

### Build for production

```bash
npm run build
npm run preview
```

---

## Deployment

Reecap is a static SPA. Deploy to Vercel, Netlify, or any static host.

> **Important:** FFmpeg WASM requires `SharedArrayBuffer`, which needs specific COOP/COEP HTTP headers.

### Vercel

Add a `vercel.json` at the project root:

```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "Cross-Origin-Embedder-Policy", "value": "require-corp" },
        { "key": "Cross-Origin-Opener-Policy", "value": "same-origin" }
      ]
    }
  ]
}
```

### Netlify

Add a `_headers` file in `/public`:

```
/*
  Cross-Origin-Embedder-Policy: require-corp
  Cross-Origin-Opener-Policy: same-origin
```

---

## Project structure

```
src/
├── components/
│   ├── ui/           # Button, Slider, Toggle, Segmented control
│   ├── layout/       # Topbar, Sidebar, Canvas, ControlPanel
│   ├── panels/       # BackgroundPanel, ExportPanel, SettingsPanel
│   └── playback/     # PlaybackBar
├── store/
│   └── reecapStore.ts # Zustand store
├── lib/
│   ├── renderer.ts   # Canvas frame rendering
│   └── encoder.ts    # FFmpeg export wrapper
├── hooks/
├── styles/
│   └── tokens.css    # CSS custom properties (design tokens)
└── types/
```

---

## Browser support

| Browser | Support |
|---|---|
| Chrome 90+ | ✅ |
| Edge 90+ | ✅ |
| Firefox 90+ | ✅ |
| Safari 15+ | ⚠️ SharedArrayBuffer polyfill may be needed |
| Mobile | ⚠️ Not optimized at v1 |

---

## Roadmap

- [ ] Background audio support
- [ ] Text / caption overlay per slide
- [ ] Brand watermark
- [ ] GIF export
- [ ] Preset themes
- [ ] Shareable link (cloud)
- [ ] Mobile layout

---

## Design

Reecap's UI is intentionally invisible — no color, no gradients, no decoration. The only thing with color in the interface is your photos.

Design references: Linear, Notion, Raycast.  
Font: Inter. Icons: Phosphor.  
Full design system and style guide in [`/docs`](./docs/).

---

## License

MIT — free to use, modify, and ship.

---

*Built by [@official.rakibulism](https://instagram.com/official.rakibulism)*