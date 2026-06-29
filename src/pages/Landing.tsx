import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ArrowRight, Sparkle, FilmStrip, TextT, Gauge, MusicNotes, Export,
  Sliders, ShieldCheck, Image as ImageIcon, DownloadSimple, Play,
  Check, Stack, MagicWand, FigmaLogo, Cube, PenNib, UsersThree, Record,
} from 'phosphor-react';
import Button from '../components/ui/Button';
import SiteLayout from '../components/site/SiteLayout';
import { useSeo, SITE_URL } from '../lib/seo';

const REPO_URL = 'https://github.com/rakibulism/reecap';
const FIGMA_PLUGIN_URL = 'https://www.figma.com/community/plugin/1650891446010350702';

const Landing: React.FC = () => {
  const navigate = useNavigate();
  const openApp = () => navigate('/app');

  useSeo({
    title: 'Reecap — Photo recaps, Motion, Design, Screen recording & a Creators community',
    description: 'Reecap is a free, browser-based creative studio: turn photos into a shareable MP4, animate designs in the Motion tool, build on an infinite-canvas Design tool, record your screen with automatic click-to-zoom, and share in the Creators community. No upload, no account.',
    path: '/',
    keywords: ['photo to video', 'recap video maker', 'slideshow maker', 'free online video editor', 'browser video editor', 'motion design tool', 'animate figma designs', 'jitter alternative', 'free design tool', 'figma alternative', 'infinite canvas design', 'creators community', 'screen recorder', 'screen recording with zoom', 'click to zoom screen recorder', 'screen studio alternative', 'free screen recorder'],
    jsonLd: [
      {
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        name: 'Reecap',
        applicationCategory: 'MultimediaApplication',
        operatingSystem: 'Web',
        url: SITE_URL,
        description: 'A free, browser-based creative studio: a photo-to-video recap editor, a layer-by-layer Motion Design tool, an infinite-canvas Design tool with a Dev mode, and a Creators community. Runs 100% client-side.',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      },
      {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: 'Reecap',
        url: SITE_URL,
        logo: `${SITE_URL}/icon-512.png`,
        sameAs: [REPO_URL, 'https://x.com/rakibulism'],
      },
    ],
  });

  return (
    <SiteLayout>
      <Hero onOpen={openApp} />
      <TrustStrip />
      <TwoTools onOpen={openApp} />
      <Steps />
      <Features />
      <MotionDesign onOpen={openApp} />
      <SpeedShowcase onOpen={openApp} />
      <Formats />
      <Privacy />
      <FinalCTA onOpen={openApp} />
    </SiteLayout>
  );
};

/* ---------------------------------------------------------------- Hero --- */

const Hero: React.FC<{ onOpen: () => void }> = ({ onOpen }) => (
  <section id="top" className="relative pt-16 sm:pt-24 pb-20 px-5 sm:px-6">
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] sm:w-[900px] h-[700px] sm:h-[900px] rounded-full bg-gradient-to-br from-blue-500/20 via-indigo-500/10 to-transparent blur-3xl" />
    </div>

    <div className="relative max-w-4xl mx-auto text-center">
      <button onClick={onOpen}
        className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/30 text-[12px] sm:text-[13px] font-semibold text-[var(--color-primary)] mb-7 hover:bg-[var(--color-primary)]/15 transition-colors">
        <MagicWand size={14} weight="fill" />
        New · Screen recording with click-to-zoom
        <ArrowRight size={13} weight="bold" />
      </button>

      <h1 className="text-[2.5rem] leading-[1.08] sm:text-6xl md:text-7xl font-bold tracking-tight mb-6">
        Bring your photos &amp; designs{' '}
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600">to life</span>
      </h1>

      <p className="text-base sm:text-xl text-[var(--color-text-secondary)] max-w-2xl mx-auto leading-relaxed mb-9">
        One browser-based studio for everything: turn photos into a cinematic MP4 recap, animate designs
        in the Motion tool, build on an infinite-canvas Design tool, record your screen with automatic
        click-to-zoom, and share it in the Creators community. No upload, no account.
      </p>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-6">
        <Button variant="primary" size="xl" onClick={onOpen} className="px-8 h-14 text-base group w-full sm:w-auto">
          Open the editor
          <ArrowRight size={18} className="ml-2 transition-transform group-hover:translate-x-1" />
        </Button>
        <a href={FIGMA_PLUGIN_URL} target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto">
          <Button variant="secondary" size="xl" className="px-8 h-14 text-base w-full border">
            <FigmaLogo size={18} weight="fill" className="mr-2" />
            Install in Figma
          </Button>
        </a>
      </div>

      <p className="text-[13px] text-[var(--color-text-muted)] flex items-center justify-center gap-4 flex-wrap">
        <span className="inline-flex items-center gap-1.5"><Check size={14} weight="bold" className="text-emerald-500" /> No sign-up</span>
        <span className="inline-flex items-center gap-1.5"><Check size={14} weight="bold" className="text-emerald-500" /> 1080p MP4</span>
        <span className="inline-flex items-center gap-1.5"><Check size={14} weight="bold" className="text-emerald-500" /> 100% private</span>
      </p>
    </div>

    <div className="relative max-w-5xl mx-auto mt-12 sm:mt-16">
      <EditorMock />
    </div>
  </section>
);

const EditorMock: React.FC = () => (
  <div className="rounded-xl sm:rounded-2xl border border-[var(--color-border-default)] bg-[var(--color-bg-surface)] shadow-2xl shadow-black/20 overflow-hidden">
    <div className="h-9 sm:h-10 px-4 flex items-center justify-between border-b border-[var(--color-border-default)] bg-[var(--color-bg-panel)]">
      <div className="flex items-center gap-2">
        <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-red-400" />
        <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-amber-400" />
        <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-emerald-400" />
      </div>
      <span className="text-[10px] sm:text-[11px] font-medium text-[var(--color-text-muted)]">reecap.app — editor</span>
      <FilmStrip size={16} className="text-[var(--color-text-muted)]" />
    </div>

    <div className="flex h-[230px] sm:h-[380px]">
      <div className="w-10 sm:w-12 shrink-0 border-r border-[var(--color-border-default)] bg-[var(--color-bg-panel)] flex flex-col items-center py-3 gap-4 text-[var(--color-text-muted)]">
        <ImageIcon size={16} /><MusicNotes size={16} /><TextT size={16} /><Stack size={16} />
      </div>

      <div className="flex-1 relative flex items-center justify-center bg-[var(--color-bg-page)] p-4 sm:p-6">
        <div className="relative w-full max-w-md aspect-video rounded-lg overflow-hidden bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600 shadow-xl">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-white/15 backdrop-blur-md border border-white/30 flex items-center justify-center">
              <Play size={20} weight="fill" className="text-white ml-0.5" />
            </div>
          </div>
          <span className="absolute bottom-3 left-1/2 -translate-x-1/2 text-white font-semibold text-xs sm:text-sm drop-shadow-lg">Our week, in motion</span>
        </div>
      </div>

      <div className="hidden sm:flex w-44 shrink-0 border-l border-[var(--color-border-default)] bg-[var(--color-bg-panel)] flex-col gap-4 p-4">
        <MockField label="Duration" value="1.5s" fill={0.3} />
        <MockField label="Speed" value="1×" fill={0.1} />
        <div>
          <p className="text-[9px] uppercase tracking-wider text-[var(--color-text-muted)] mb-1.5">Transition</p>
          <div className="grid grid-cols-2 gap-1.5">
            {['Fade', 'Slide', 'Zoom', 'Wipe'].map((t, i) => (
              <span key={t} className={`text-[9px] text-center py-1 rounded ${i === 0 ? 'bg-[var(--color-interactive)] text-[var(--color-text-inverse)]' : 'bg-[var(--color-bg-surface)] border border-[var(--color-border-default)] text-[var(--color-text-muted)]'}`}>{t}</span>
            ))}
          </div>
        </div>
      </div>
    </div>

    <div className="h-16 sm:h-20 border-t border-[var(--color-border-default)] bg-[var(--color-bg-panel)] flex items-center gap-2 px-4 overflow-hidden">
      {['from-rose-400 to-orange-400', 'from-sky-400 to-blue-500', 'from-emerald-400 to-teal-500', 'from-violet-400 to-fuchsia-500', 'from-amber-400 to-yellow-500', 'from-indigo-400 to-blue-600'].map((g, i) => (
        <div key={i} className={`h-10 sm:h-12 w-16 sm:w-20 shrink-0 rounded-md bg-gradient-to-br ${g} ${i === 0 ? 'ring-2 ring-[var(--color-primary)] ring-offset-2 ring-offset-[var(--color-bg-panel)]' : 'opacity-80'}`} />
      ))}
    </div>
  </div>
);

const MockField: React.FC<{ label: string; value: string; fill: number }> = ({ label, value, fill }) => (
  <div>
    <p className="text-[9px] uppercase tracking-wider text-[var(--color-text-muted)] mb-1.5">{label}</p>
    <div className="h-7 rounded-md bg-[var(--color-bg-hover)] border border-[var(--color-border-default)] relative flex items-center px-2">
      <span className="text-[10px] font-semibold text-[var(--color-text-secondary)]">{value}</span>
      <div className="absolute top-1/2 -translate-y-1/2 w-3 h-4 rounded bg-[var(--color-bg-surface)] border border-[var(--color-border-default)]" style={{ left: `${fill * 100}%` }} />
    </div>
  </div>
);

/* -------------------------------------------------------- Trust strip --- */

const TrustStrip: React.FC = () => (
  <section className="border-y border-[var(--color-border-default)] bg-[var(--color-bg-panel)]/40">
    <div className="max-w-5xl mx-auto px-5 sm:px-6 py-5 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
      {[
        { icon: <MagicWand size={18} weight="fill" />, label: 'Motion Design' },
        { icon: <PenNib size={18} weight="fill" />, label: 'Design tool' },
        { icon: <Record size={18} weight="fill" />, label: 'Screen recorder' },
        { icon: <ShieldCheck size={18} weight="fill" />, label: 'No upload' },
      ].map((b) => (
        <div key={b.label} className="flex items-center justify-center gap-2 text-[12px] sm:text-[13px] font-medium text-[var(--color-text-secondary)]">
          <span className="text-[var(--color-primary)]">{b.icon}</span>
          {b.label}
        </div>
      ))}
    </div>
  </section>
);

/* ----------------------------------------------------------- Two tools --- */

const TOOLS = [
  { icon: <FilmStrip size={22} weight="duotone" />, eyebrow: 'Video Editor', title: 'Photos → cinematic recap', body: 'Drop in photos, set transitions, captions, music and timing on a real timeline, then export a 1080p MP4 — every animation baked in.', tint: 'bg-blue-500/10 text-blue-500' },
  { icon: <MagicWand size={22} weight="duotone" />, eyebrow: 'Motion Design', title: 'Animate designs, layer by layer', body: 'Paste a frame from Figma, then bring text, shapes and groups to life with keyframe-free presets and a scrubbable timeline.', tint: 'bg-violet-500/10 text-violet-500', tag: 'New' },
  { icon: <PenNib size={22} weight="duotone" />, eyebrow: 'Design tool', title: 'An infinite design canvas', body: 'Frames, shapes, pen, pencil, text and text-on-path on an infinite canvas — with a Dev mode that hands you copy-ready CSS or SVG.', tint: 'bg-amber-500/10 text-amber-600', tag: 'New' },
  { icon: <Record size={22} weight="duotone" />, eyebrow: 'Screen recorder', title: 'Record with auto click-zoom', body: 'Capture your screen and every click smoothly zooms into that spot — Screen-Studio style. Tune the zoom, then export MP4 or WebM.', tint: 'bg-red-500/10 text-red-500', tag: 'New' },
  { icon: <UsersThree size={22} weight="duotone" />, eyebrow: 'Creators community', title: 'Share & follow creators', body: 'Post your photos, animations and designs, follow other creators, and engage with reactions, comments, shares and reposts.', tint: 'bg-rose-500/10 text-rose-500', tag: 'New' },
];

const TwoTools: React.FC<{ onOpen: () => void }> = ({ onOpen }) => (
  <section className="max-w-5xl mx-auto px-5 sm:px-6 py-16 sm:py-20">
    <SectionHeading eyebrow="One studio, many ways to create" title="Everything you need to make and share" />
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-12 sm:mt-14">
      {TOOLS.map((t) => (
        <button key={t.eyebrow} onClick={onOpen} className="text-left p-6 sm:p-7 rounded-2xl bg-[var(--color-bg-surface)] border border-[var(--color-border-default)] hover:border-[var(--color-primary)]/40 transition-colors relative group">
          {t.tag && <span className="absolute top-5 right-5 text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded bg-[var(--color-primary)]/15 text-[var(--color-primary)]">{t.tag}</span>}
          <div className={`w-12 h-12 rounded-xl ${t.tint} flex items-center justify-center mb-5`}>{t.icon}</div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--color-text-muted)] mb-1.5">{t.eyebrow}</p>
          <h3 className="text-xl font-bold mb-2">{t.title}</h3>
          <p className="text-[var(--color-text-secondary)] leading-relaxed text-[15px]">{t.body}</p>
          <span className="inline-flex items-center gap-1.5 mt-4 text-[14px] font-semibold text-[var(--color-primary)] opacity-0 group-hover:opacity-100 transition-opacity">
            Open <ArrowRight size={15} weight="bold" />
          </span>
        </button>
      ))}
    </div>
  </section>
);

/* --------------------------------------------------- Motion Design tool --- */

const MotionDesign: React.FC<{ onOpen: () => void }> = ({ onOpen }) => (
  <section id="motion" className="border-y border-[var(--color-border-default)] bg-[var(--color-bg-panel)]/30">
    <div className="max-w-6xl mx-auto px-5 sm:px-6 py-16 sm:py-24 grid lg:grid-cols-2 gap-12 lg:gap-14 items-center">
      <div className="order-2 lg:order-1 relative">
        <div className="absolute -inset-6 bg-gradient-to-br from-[var(--color-primary)]/15 to-fuchsia-500/10 blur-2xl rounded-full" />
        <MotionMock />
      </div>
      <div className="order-1 lg:order-2">
        <SectionHeading align="left" eyebrow="New in Reecap" title="A Motion Design tool, built right in" />
        <p className="mt-5 text-[15px] sm:text-base text-[var(--color-text-secondary)] leading-relaxed max-w-lg">
          A second canvas for designers — animate UI screens and graphics layer by layer, no complex
          keyframes. Perfect for turning a static design into a scroll-stopping clip.
        </p>
        <ul className="mt-7 space-y-4">
          {[
            { icon: <FigmaLogo size={18} weight="fill" />, t: 'Paste a Figma frame — editable text, shapes, frames & groups, with their colors.' },
            { icon: <Sparkle size={18} weight="fill" />, t: 'Keyframe-free presets: fade, slide, scale, pop, blur, rotate — with spring & bounce easing.' },
            { icon: <Stack size={18} weight="fill" />, t: 'Group, reorder and time layers on a draggable, zoomable timeline.' },
            { icon: <Cube size={18} weight="fill" />, t: 'Switch between the video editor and Motion in a single click.' },
          ].map((b) => (
            <li key={b.t} className="flex items-start gap-3 text-[15px] text-[var(--color-text-secondary)]">
              <span className="text-[var(--color-primary)] mt-0.5 shrink-0">{b.icon}</span>
              {b.t}
            </li>
          ))}
        </ul>
        <div className="mt-9 flex flex-wrap items-center gap-3">
          <Button variant="primary" size="lg" onClick={onOpen} className="group">
            Open Motion Design
            <ArrowRight size={16} className="ml-1.5 transition-transform group-hover:translate-x-0.5" />
          </Button>
          <a href={FIGMA_PLUGIN_URL} target="_blank" rel="noopener noreferrer">
            <Button variant="secondary" size="lg" className="border">
              <FigmaLogo size={16} weight="fill" className="mr-2" />
              Install Figma plugin
            </Button>
          </a>
        </div>
      </div>
    </div>
  </section>
);

const MotionMock: React.FC = () => (
  <div className="relative rounded-xl sm:rounded-2xl border border-[var(--color-border-default)] bg-[var(--color-bg-surface)] shadow-2xl shadow-black/20 overflow-hidden">
    <div className="h-9 px-4 flex items-center justify-between border-b border-[var(--color-border-default)] bg-[var(--color-bg-panel)]">
      <div className="flex items-center gap-1.5 text-[10px] font-semibold">
        <span className="px-2 py-0.5 rounded bg-[var(--color-bg-surface)] text-[var(--color-text-muted)]">Video</span>
        <span className="px-2 py-0.5 rounded bg-[var(--color-primary)] text-white">Motion</span>
      </div>
      <span className="text-[10px] font-medium text-[var(--color-text-muted)]">reecap.app — motion</span>
      <MagicWand size={15} className="text-[var(--color-primary)]" />
    </div>

    <div className="flex h-[210px] sm:h-[300px]">
      {/* layers */}
      <div className="w-24 sm:w-32 shrink-0 border-r border-[var(--color-border-default)] bg-[var(--color-bg-panel)] p-2 space-y-1">
        {[{ i: <Cube size={11} />, n: 'Card', s: true }, { i: <TextT size={11} />, n: 'Title', p: true }, { i: <Stack size={11} />, n: 'Button', p: true }, { i: <ImageIcon size={11} />, n: 'Logo', p: true }].map((l) => (
          <div key={l.n} className={`flex items-center gap-1.5 px-1.5 h-6 rounded text-[10px] font-medium ${l.s ? 'bg-[var(--color-primary)]/15 text-[var(--color-primary)]' : 'text-[var(--color-text-secondary)]'} ${l.p ? 'pl-4' : ''}`}>
            {l.i}<span className="truncate">{l.n}</span>
          </div>
        ))}
      </div>

      {/* canvas */}
      <div className="flex-1 relative flex items-center justify-center bg-[var(--color-bg-page)] p-4">
        <div className="relative w-full max-w-[220px] aspect-[4/3] rounded-lg bg-[#1E293B] shadow-xl overflow-hidden flex flex-col justify-between p-4">
          <span className="text-white font-bold text-sm">Welcome</span>
          <div className="w-20 h-6 rounded-md bg-[var(--color-primary)]" />
          <span className="absolute -inset-px rounded-lg ring-2 ring-[var(--color-primary)] ring-inset pointer-events-none" />
        </div>
      </div>
    </div>

    {/* timeline */}
    <div className="border-t border-[var(--color-border-default)] bg-[var(--color-bg-panel)] p-2 space-y-1">
      {[0.0, 0.18, 0.32].map((off, i) => (
        <div key={i} className="flex items-center gap-2 h-4">
          <div className="h-2.5 rounded-sm bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary)]/40" style={{ marginLeft: `${off * 100}%`, width: `${55 - off * 60}%` }} />
        </div>
      ))}
    </div>
  </div>
);

/* --------------------------------------------------------------- Steps --- */

const Steps: React.FC = () => (
  <section id="how" className="max-w-5xl mx-auto px-5 sm:px-6 py-16 sm:py-24">
    <SectionHeading eyebrow="How it works" title="From camera roll to MP4 in three steps" />
    <div className="grid md:grid-cols-3 gap-5 mt-12 sm:mt-14">
      {[
        { n: '01', icon: <ImageIcon size={24} weight="duotone" />, title: 'Upload', body: 'Drag in 2–30 photos — JPG, PNG, or WebP. Reorder them on the timeline.' },
        { n: '02', icon: <Sliders size={24} weight="duotone" />, title: 'Customize', body: 'Pick transitions, per-slide timing, captions, background, and music.' },
        { n: '03', icon: <DownloadSimple size={24} weight="duotone" />, title: 'Export', body: 'Render a crisp 1080p MP4 with every transition and animation baked in.' },
      ].map((s) => (
        <div key={s.n} className="relative p-6 sm:p-7 rounded-2xl bg-[var(--color-bg-surface)] border border-[var(--color-border-default)]">
          <span className="absolute top-6 right-6 text-3xl font-bold text-[var(--color-border-default)] tabular-nums">{s.n}</span>
          <div className="w-12 h-12 rounded-xl bg-[var(--color-primary)]/10 text-[var(--color-primary)] flex items-center justify-center mb-5">{s.icon}</div>
          <h3 className="text-lg font-bold mb-2">{s.title}</h3>
          <p className="text-[var(--color-text-secondary)] leading-relaxed text-[15px]">{s.body}</p>
        </div>
      ))}
    </div>
  </section>
);

/* ------------------------------------------------------------ Features --- */

const FEATURES = [
  { icon: <FilmStrip size={22} weight="duotone" />, title: 'Cinematic transitions', body: 'Fade, slide, zoom, wipe, flip, dissolve and more — eight styles, set per slide.' },
  { icon: <Stack size={22} weight="duotone" />, title: 'A real timeline', body: 'Reorder by drag, set per-slide duration with proportional clips, scrub the playhead.' },
  { icon: <TextT size={22} weight="duotone" />, title: 'Captions that move', body: 'Drag text anywhere, recolor it, add a background pill, and animate it — fade, pop, slide, or typewriter.' },
  { icon: <Gauge size={22} weight="duotone" />, title: 'Whole-video speed', body: 'Speed the entire recap from 0.5× up to 10×. Audio plays across it at its natural pitch.' },
  { icon: <MusicNotes size={22} weight="duotone" />, title: 'Music, in sync', body: 'Drop in a track from the library; it plays across your recap and exports with the video.' },
  { icon: <Export size={22} weight="duotone" />, title: 'Real MP4 export', body: 'Hardware-accelerated WebCodecs renders every frame — transitions and motion baked in.' },
];

const Features: React.FC = () => (
  <section id="features" className="border-y border-[var(--color-border-default)] bg-[var(--color-bg-panel)]/30">
    <div className="max-w-6xl mx-auto px-5 sm:px-6 py-16 sm:py-24">
      <SectionHeading eyebrow="Everything you need" title="A focused editor, not a fixed slideshow" />
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-12 sm:mt-14">
        {FEATURES.map((f) => (
          <div key={f.title} className="group p-6 sm:p-7 rounded-2xl bg-[var(--color-bg-surface)] border border-[var(--color-border-default)] hover:border-[var(--color-primary)]/40 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-[var(--color-primary)]/10 text-[var(--color-primary)] flex items-center justify-center mb-5 group-hover:scale-105 transition-transform">{f.icon}</div>
            <h3 className="text-lg font-bold mb-2">{f.title}</h3>
            <p className="text-[var(--color-text-secondary)] leading-relaxed text-[15px]">{f.body}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

/* ------------------------------------------------------ Speed showcase --- */

const SpeedShowcase: React.FC<{ onOpen: () => void }> = ({ onOpen }) => (
  <section className="max-w-6xl mx-auto px-5 sm:px-6 py-16 sm:py-24 grid lg:grid-cols-2 gap-12 lg:gap-14 items-center">
    <div>
      <SectionHeading align="left" eyebrow="Made for sharing" title="Tune the pace, then post it anywhere" />
      <ul className="mt-8 space-y-4">
        {[
          'Per-slide timing for breathing room — or a snappy montage.',
          'A whole-video speed dial from gentle 0.5× to a 10× blur.',
          'Captions animate in to land the beat of each shot.',
          'Export to landscape, vertical, or square in one tap.',
        ].map((t) => (
          <li key={t} className="flex items-start gap-3 text-[15px] text-[var(--color-text-secondary)]">
            <Check size={18} weight="bold" className="text-emerald-500 mt-0.5 shrink-0" />
            {t}
          </li>
        ))}
      </ul>
      <Button variant="primary" size="lg" onClick={onOpen} className="mt-9 group">
        Start your recap
        <ArrowRight size={16} className="ml-1.5 transition-transform group-hover:translate-x-0.5" />
      </Button>
    </div>

    <div className="relative">
      <div className="absolute -inset-6 bg-gradient-to-br from-blue-500/15 to-blue-600/10 blur-2xl rounded-full" />
      <div className="relative grid grid-cols-2 gap-4 max-w-sm mx-auto lg:max-w-none">
        {[
          { ratio: 'aspect-[9/16]', g: 'from-rose-400 to-orange-500', label: '9:16 · Reels' },
          { ratio: 'aspect-square', g: 'from-sky-400 to-indigo-500', label: '1:1 · Feed' },
          { ratio: 'aspect-square', g: 'from-emerald-400 to-teal-500', label: '1:1 · Feed' },
          { ratio: 'aspect-[9/16]', g: 'from-violet-400 to-fuchsia-500', label: '9:16 · Shorts' },
        ].map((c, i) => (
          <div key={i} className={`${c.ratio} rounded-xl bg-gradient-to-br ${c.g} shadow-lg relative overflow-hidden ${i % 2 ? 'mt-6' : ''}`}>
            <span className="absolute bottom-2 left-2 text-[10px] font-semibold text-white/90 drop-shadow">{c.label}</span>
          </div>
        ))}
      </div>
    </div>
  </section>
);

/* ------------------------------------------------------------- Formats --- */

const Formats: React.FC = () => (
  <section className="border-t border-[var(--color-border-default)]">
    <div className="max-w-5xl mx-auto px-6 py-14 sm:py-16 text-center">
      <p className="text-[13px] font-semibold uppercase tracking-[0.1em] text-[var(--color-text-muted)] mb-6">Every aspect ratio</p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        {['16:9', '9:16', '1:1', '4:3', '5:4'].map((r) => (
          <span key={r} className="px-4 sm:px-5 py-2.5 rounded-full border border-[var(--color-border-default)] bg-[var(--color-bg-surface)] text-sm font-bold tabular-nums">{r}</span>
        ))}
      </div>
    </div>
  </section>
);

/* ------------------------------------------------------------- Privacy --- */

const Privacy: React.FC = () => (
  <section id="privacy" className="max-w-4xl mx-auto px-5 sm:px-6 py-16 sm:py-24 text-center">
    <div className="w-16 h-16 mx-auto rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mb-7">
      <ShieldCheck size={32} weight="duotone" />
    </div>
    <h2 className="text-2xl sm:text-4xl font-bold tracking-tight mb-5">Your photos never leave your device</h2>
    <p className="text-base sm:text-lg text-[var(--color-text-secondary)] leading-relaxed max-w-2xl mx-auto">
      Reecap runs entirely in your browser. Rendering, encoding, and export all happen on your
      machine — no servers, no accounts, no tracking. Close the tab and nothing is left behind.
    </p>
  </section>
);

/* ----------------------------------------------------------- Final CTA --- */

const FinalCTA: React.FC<{ onOpen: () => void }> = ({ onOpen }) => (
  <section className="px-5 sm:px-6 pb-20 sm:pb-24">
    <div className="relative max-w-5xl mx-auto rounded-3xl overflow-hidden border border-[var(--color-border-default)] bg-gradient-to-br from-blue-600 to-indigo-700 px-6 sm:px-8 py-14 sm:py-16 text-center">
      <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_30%_20%,white,transparent_40%)]" />
      <div className="relative">
        <h2 className="text-2xl sm:text-5xl font-bold tracking-tight text-white mb-4">Make your first recap now</h2>
        <p className="text-blue-100 text-base sm:text-lg mb-8 max-w-xl mx-auto">Free, open source, and ready in your browser. No account required.</p>
        <button onClick={onOpen} className="inline-flex items-center gap-2 px-8 h-14 rounded-xl bg-white text-blue-700 font-bold text-base shadow-xl hover:scale-[1.02] active:scale-95 transition-transform">
          Open the editor
          <ArrowRight size={18} weight="bold" />
        </button>
        <p className="mt-5">
          <Link to="/pricing" className="text-blue-100 hover:text-white text-sm font-medium underline underline-offset-4 transition-colors">
            See plans &amp; pricing →
          </Link>
        </p>
      </div>
    </div>
  </section>
);

/* -------------------------------------------------------------- shared --- */

const SectionHeading: React.FC<{ eyebrow: string; title: string; align?: 'center' | 'left' }> = ({ eyebrow, title, align = 'center' }) => (
  <div className={align === 'center' ? 'text-center max-w-2xl mx-auto' : 'max-w-xl'}>
    <p className="text-[13px] font-semibold uppercase tracking-[0.1em] text-[var(--color-primary)] mb-3">{eyebrow}</p>
    <h2 className="text-2xl sm:text-4xl font-bold tracking-tight leading-tight">{title}</h2>
  </div>
);

export default Landing;
