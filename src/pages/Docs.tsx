import React from 'react';
import SiteLayout from '../components/site/SiteLayout';

interface Section { id: string; title: string; blocks: { type: 'p' | 'ul'; text?: string; items?: string[] }[]; }

const SECTIONS: Section[] = [
  {
    id: 'getting-started', title: 'Getting started',
    blocks: [
      { type: 'p', text: 'Reecap turns a batch of photos into an animated MP4 — entirely in your browser. There’s nothing to install (though you can install it as an app) and no account to create. Open the editor and drag in your photos to begin.' },
    ],
  },
  {
    id: 'importing', title: 'Importing photos',
    blocks: [
      { type: 'p', text: 'Drag and drop 2–30 images onto the canvas, or click Browse files. JPG, PNG, and WebP are supported.' },
      { type: 'ul', items: ['Reorder slides by dragging them on the timeline.', 'Remove a slide from the timeline or media shelf.', 'Everything stays on your device — files are never uploaded.'] },
    ],
  },
  {
    id: 'timeline', title: 'Timeline & timing',
    blocks: [
      { type: 'p', text: 'The timeline is a real editing surface. Each clip’s width is proportional to its duration, and a playhead scrubs as it plays.' },
      { type: 'ul', items: ['Set a per-slide duration, or apply one duration to all slides.', 'Use the playback controls to preview, step between slides, and check timing.'] },
    ],
  },
  {
    id: 'transitions', title: 'Transitions',
    blocks: [
      { type: 'p', text: 'Choose from eight transition styles — Fade, Slide, Slide Up, Zoom, Wipe, Flip, Dissolve, or None — set individually per slide or applied to all.' },
      { type: 'p', text: 'Transitions are baked into the exported MP4, not just shown in the preview.' },
    ],
  },
  {
    id: 'captions', title: 'Captions',
    blocks: [
      { type: 'p', text: 'Add a text caption to any slide. Position it with the Top / Center / Bottom presets, or drag it anywhere on the canvas.' },
      { type: 'ul', items: ['Pick a text color and an optional background pill.', 'Animate it in: Fade, Pop, Slide ↑/↓, or Typewriter.', 'Captions render in both the preview and the export.'] },
    ],
  },
  {
    id: 'music', title: 'Music',
    blocks: [
      { type: 'p', text: 'Open the music library and select a track to add background audio. It plays across your recap in the preview and is muxed into the exported video.' },
    ],
  },
  {
    id: 'speed', title: 'Speed',
    blocks: [
      { type: 'p', text: 'The speed control at the top-left of the timeline sets the pace of the entire video, from 0.5× up to 10×. It applies to both the preview and the export. Audio plays at its natural pitch and simply spans the sped-up video.' },
    ],
  },
  {
    id: 'exporting', title: 'Exporting',
    blocks: [
      { type: 'p', text: 'Press Export to render an MP4. Reecap composites every frame at 30fps with hardware-accelerated WebCodecs, so transitions and animations are included in the file.' },
      { type: 'ul', items: ['Choose your aspect ratio: 16:9, 9:16, 1:1, 4:3, or 5:4.', 'Pick 720p (1×) or 1080p (2×) quality.', 'The finished MP4 downloads straight to your device.'] },
    ],
  },
  {
    id: 'privacy', title: 'Privacy',
    blocks: [
      { type: 'p', text: 'Reecap is 100% client-side. Your photos, audio, and rendered video never leave your browser — there are no servers, accounts, or analytics on your media.' },
    ],
  },
];

const Docs: React.FC = () => (
  <SiteLayout>
    <div className="max-w-6xl mx-auto px-5 sm:px-6 py-14 sm:py-20">
      <header className="mb-10">
        <p className="text-[13px] font-semibold uppercase tracking-[0.1em] text-[var(--color-primary)] mb-3">Documentation</p>
        <h1 className="text-3xl sm:text-5xl font-bold tracking-tight">How to use Reecap</h1>
      </header>

      <div className="lg:grid lg:grid-cols-[200px_1fr] lg:gap-12">
        {/* TOC */}
        <nav className="hidden lg:block sticky top-24 self-start">
          <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--color-text-muted)] mb-3">On this page</p>
          <ul className="space-y-2">
            {SECTIONS.map((s) => (
              <li key={s.id}>
                <a href={`#${s.id}`} className="text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] transition-colors">{s.title}</a>
              </li>
            ))}
          </ul>
        </nav>

        {/* Content */}
        <div className="max-w-2xl">
          {SECTIONS.map((s) => (
            <section key={s.id} id={s.id} className="scroll-mt-24 mb-12">
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight mb-4">{s.title}</h2>
              <div className="space-y-4">
                {s.blocks.map((b, i) =>
                  b.type === 'p' ? (
                    <p key={i} className="text-[var(--color-text-secondary)] leading-relaxed">{b.text}</p>
                  ) : (
                    <ul key={i} className="space-y-2">
                      {b.items!.map((it) => (
                        <li key={it} className="flex gap-2.5 text-[var(--color-text-secondary)] leading-relaxed">
                          <span className="mt-2 w-1.5 h-1.5 rounded-full bg-[var(--color-primary)] shrink-0" />
                          {it}
                        </li>
                      ))}
                    </ul>
                  )
                )}
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  </SiteLayout>
);

export default Docs;
