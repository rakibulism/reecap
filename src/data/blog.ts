export interface BlogPost {
  slug: string;
  title: string;
  date: string;        // ISO
  readingTime: string;
  excerpt: string;
  cover: string;       // tailwind gradient classes
  /** Body as an array of blocks. */
  body: { type: 'p' | 'h2'; text: string }[];
}

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: 'introducing-reecap-1-0',
    title: 'Introducing Reecap 1.0',
    date: '2026-06-21',
    readingTime: '3 min read',
    excerpt: 'A focused, browser-based editor that turns your photos into a cinematic recap — no upload, no account.',
    cover: 'from-blue-500 via-indigo-500 to-violet-600',
    body: [
      { type: 'p', text: 'Reecap started from a simple frustration: you have great photos from a week, a trip, or a project, but turning them into something worth sharing means wrestling with heavy editing software.' },
      { type: 'h2', text: 'Built for speed' },
      { type: 'p', text: 'Reecap is the opposite of that. Drop in 2–30 photos, pick a transition and some music, and export a clean 1080p MP4 — all without leaving your browser tab.' },
      { type: 'h2', text: 'What 1.0 includes' },
      { type: 'p', text: 'Eight cinematic transitions, a real timeline with per-slide timing, draggable animated captions, a whole-video speed dial up to 10×, background music, and a true frame-by-frame MP4 export that bakes every transition and animation into the file.' },
      { type: 'p', text: 'And because it runs entirely on your device, nothing you import ever touches a server.' },
    ],
  },
  {
    slug: 'rendering-video-in-the-browser',
    title: 'How Reecap renders video entirely in your browser',
    date: '2026-06-20',
    readingTime: '5 min read',
    excerpt: 'A look under the hood at the WebCodecs pipeline that turns a timeline into an MP4 — locally.',
    cover: 'from-emerald-400 via-teal-500 to-cyan-600',
    body: [
      { type: 'p', text: 'Exporting video on the web used to mean shipping your files to a server farm. Reecap does it on your machine using the browser’s native WebCodecs API.' },
      { type: 'h2', text: 'Frame by frame' },
      { type: 'p', text: 'For each moment in the timeline, Reecap composites the background, the current and incoming slides with their transition transforms, and any animated captions onto a canvas. That canvas becomes a VideoFrame.' },
      { type: 'h2', text: 'Hardware-accelerated encoding' },
      { type: 'p', text: 'Those frames are fed straight into a hardware-accelerated H.264 encoder and muxed into an MP4 in memory — no round-trips, no uploads, no waiting in a queue.' },
    ],
  },
  {
    slug: 'five-tips-for-better-recaps',
    title: 'Five tips for better photo recaps',
    date: '2026-06-19',
    readingTime: '4 min read',
    excerpt: 'Small choices — pacing, captions, music — that make a recap feel intentional instead of automatic.',
    cover: 'from-rose-400 via-orange-400 to-amber-500',
    body: [
      { type: 'p', text: 'A good recap is mostly about rhythm. Here are five quick ways to make yours land.' },
      { type: 'h2', text: '1. Vary your pacing' },
      { type: 'p', text: 'Give your strongest shots a little more time, and let filler slides move quickly. Per-slide duration is your friend.' },
      { type: 'h2', text: '2. Let captions breathe' },
      { type: 'p', text: 'One short line, animated in, is worth more than a paragraph. Place it where it won’t fight the subject.' },
      { type: 'h2', text: '3. Match music to motion' },
      { type: 'p', text: 'Pick a track first, then tune your speed so the cuts feel like they sit on the beat.' },
    ],
  },
];

export const getPost = (slug: string) => BLOG_POSTS.find((p) => p.slug === slug);
