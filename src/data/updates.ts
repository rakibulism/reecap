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
    id: 'recorder-screen-cam-voice',
    date: '2026-06-24',
    version: 'v1.17.0',
    tag: 'feature',
    title: 'Record your whole screen — with webcam & voice',
    summary: 'The Reecap Recorder extension now records your entire screen, so the recording keeps going as you move between tabs, windows and apps. A floating control bar (pause / resume / stop) and your webcam bubble follow you onto every page, and you can capture your microphone and tab/system audio. Click-to-zoom and MP4/WebM export still apply.',
  },
  {
    id: 'recorder-extension-flow',
    date: '2026-06-24',
    version: 'v1.16.0',
    tag: 'improvement',
    title: 'A smoother recording flow & on-page controls',
    summary: 'The Reecap Recorder extension now opens a setup page to review what you’re recording, drops you back on your tab with a floating Pause / Resume / Stop bar, and reliably hands the finished clip to the Screen Recorder. Capture stays tab-only — never microphone or camera.',
  },
  {
    id: 'recorder-mp4',
    date: '2026-06-24',
    version: 'v1.15.0',
    tag: 'feature',
    title: 'Export recordings as MP4',
    summary: 'The screen recorder now exports a hardware-encoded H.264 MP4 (alongside WebM), with the click-zoom baked in frame by frame via WebCodecs — ready to share anywhere.',
  },
  {
    id: 'screen-recorder',
    date: '2026-06-24',
    version: 'v1.14.0',
    tag: 'release',
    title: 'Screen recorder with click-to-zoom',
    summary: 'A new Recorder tool: capture your screen and every click smoothly zooms into that spot in the final video — Screen-Studio style. Record in-app, or install the Reecap Recorder Chrome extension to capture click-zoom on any website you visit. Tune zoom level and timing, then export.',
  },
  {
    id: 'creators-community',
    date: '2026-06-23',
    version: 'v1.12.0',
    tag: 'release',
    title: 'Introducing the Creators community',
    summary: 'A social home for everyone building with Reecap. Follow creators, post your photos, animations and designs, and engage with reactions, comments, shares and reposts. The templates + audio hub now lives under an Assets tab.',
  },
  {
    id: 'design-export',
    date: '2026-06-23',
    version: 'v1.12.0',
    tag: 'feature',
    title: 'Export your designs as PNG or SVG',
    summary: 'The Design tool now exports the whole canvas to a crisp 2× PNG or a clean, scalable SVG — straight from the Export button.',
  },
  {
    id: 'design-tool-launch',
    date: '2026-06-23',
    version: 'v1.11.0',
    tag: 'release',
    title: 'The Design tool — an infinite canvas',
    summary: 'A third studio mode joins Video and Motion: a Figma-style vector editor with frames, shapes, pen, pencil, text and text-on-path on an infinite, pannable canvas — plus a nested Dev tool that turns any layer into copy-ready CSS or SVG.',
  },
  {
    id: 'motion-live-duration',
    date: '2026-06-23',
    version: 'v1.10.0',
    tag: 'improvement',
    title: 'Motion timeline grows as you drag',
    summary: 'Drag a clip past the composition end and the timeline now stretches live to fit it — no more bumping the duration by hand first.',
  },
  {
    id: 'shortcuts-and-flows',
    date: '2026-06-23',
    version: 'v1.9.0',
    tag: 'improvement',
    title: 'Full shortcuts list, Premium & Invite flows',
    summary: 'Every keyboard shortcut is now documented in one modal, Motion gained duplicate/delete keys and auto-fit duration, and the Subscribe Premium and Invite & Earn Audio flows are fully interactive.',
  },
  {
    id: 'motion-figma-import',
    date: '2026-06-23',
    version: 'v1.6',
    tag: 'feature',
    title: 'Bring your Figma designs into Motion',
    summary: 'A companion Figma plugin copies any frame — paste it into the Motion tool and it lands as one editable frame with its text, shapes, groups and colors intact, ready to animate.',
  },
  {
    id: 'motion-accounts-menu',
    date: '2026-06-22',
    tag: 'improvement',
    title: 'Accounts, settings & help in one menu',
    summary: 'Sign in as a Free or Pro member, switch themes, and reach the docs and support from a single expanded sidebar.',
  },
  {
    id: 'motion-grouping-timeline',
    date: '2026-06-22',
    tag: 'improvement',
    title: 'Layer grouping and a hands-on timeline',
    summary: 'Group layers, reorder with right-click and keyboard shortcuts, and drag, resize, zoom and fit clips on the reworked Motion timeline.',
  },
  {
    id: 'motion-design-launch',
    date: '2026-06-22',
    version: 'v1.2.0',
    tag: 'release',
    title: 'Introducing Motion Design',
    summary: 'A whole new tool inside Reecap — a layer-by-layer animation studio. Add text, shapes and images, give each layer a keyframe-free preset with easing, and scrub a timeline. Switch between the video editor and Motion in one click.',
  },
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
