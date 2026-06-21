export type UpdateTag = 'release' | 'feature' | 'improvement' | 'fix';

export interface Update {
  id: string;        // stable, unique — also used for the "seen" marker
  date: string;      // ISO date
  version?: string;
  tag: UpdateTag;
  title: string;
  summary: string;
}

// Newest first.
export const UPDATES: Update[] = [
  {
    id: 'pwa-install',
    date: '2026-06-21',
    tag: 'feature',
    title: 'Install Reecap as an app',
    summary: 'Reecap is now a PWA — install it from the browser and it launches straight into the editor, even offline-friendly.',
  },
  {
    id: 'v1-release',
    date: '2026-06-21',
    version: 'v1.0.0',
    tag: 'release',
    title: 'Reecap 1.0 is here',
    summary: 'The first stable release — a focused, fully browser-based editor that turns your photos into a shareable MP4.',
  },
  {
    id: 'transitions-in-export',
    date: '2026-06-20',
    tag: 'feature',
    title: 'Transitions & animation now render into your MP4',
    summary: 'Export went frame-by-frame: every cinematic transition and caption animation is baked into the exported video.',
  },
  {
    id: 'captions-2',
    date: '2026-06-19',
    tag: 'feature',
    title: 'Captions you can drag, color & animate',
    summary: 'Place text anywhere on the canvas, set its color and background, and animate it in — fade, pop, slide, or typewriter.',
  },
  {
    id: 'speed-10x',
    date: '2026-06-18',
    tag: 'feature',
    title: 'Whole-video speed up to 10×',
    summary: 'A speed dial for the entire recap, from a gentle 0.5× to a 10× blur. Audio stays at its natural pitch.',
  },
  {
    id: 'timeline-rework',
    date: '2026-06-17',
    tag: 'improvement',
    title: 'A real, scrubbable timeline',
    summary: 'Per-slide durations with proportional clips, smooth slider drag, and a redesigned control panel.',
  },
];

export const LATEST_UPDATE_ID = UPDATES[0].id;

export const TAG_LABEL: Record<UpdateTag, string> = {
  release: 'Release',
  feature: 'New',
  improvement: 'Improved',
  fix: 'Fix',
};
