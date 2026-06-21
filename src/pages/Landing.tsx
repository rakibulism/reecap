import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight, Sparkle, FilmStrip, TextT, Gauge, MusicNotes, Export,
  Sliders, ShieldCheck, Image as ImageIcon, DownloadSimple, Play,
  GithubLogo, TwitterLogo, Check, Lightning, Stack,
} from 'phosphor-react';
import Button from '../components/ui/Button';

const REPO_URL = 'https://github.com/rakibulism/reecap';

const Landing: React.FC = () => {
  const navigate = useNavigate();
  const openApp = () => navigate('/app');

  return (
    <div className="min-h-screen bg-[var(--color-bg-page)] text-[var(--color-text-primary)] font-sans antialiased overflow-x-hidden">
      <Nav onOpen={openApp} />
      <Hero onOpen={openApp} />
      <TrustStrip />
      <Steps />
      <Features />
      <SpeedShowcase onOpen={openApp} />
      <Formats />
      <Privacy />
      <FinalCTA onOpen={openApp} />
      <Footer />
    </div>
  );
};

/* ----------------------------------------------------------------- Nav --- */

const Nav: React.FC<{ onOpen: () => void }> = ({ onOpen }) => (
  <header className="fixed top-0 inset-x-0 z-50 border-b border-[var(--color-border-default)]/40 bg-[var(--color-bg-page)]/70 backdrop-blur-xl">
    <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
      <a href="#top" className="flex items-center gap-2.5">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/25">
          <FilmStrip size={20} weight="fill" className="text-white" />
        </div>
        <span className="text-lg font-bold tracking-tight">Reecap</span>
      </a>
      <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-[var(--color-text-secondary)]">
        <a href="#features" className="hover:text-[var(--color-text-primary)] transition-colors">Features</a>
        <a href="#how" className="hover:text-[var(--color-text-primary)] transition-colors">How it works</a>
        <a href="#privacy" className="hover:text-[var(--color-text-primary)] transition-colors">Privacy</a>
        <a href={REPO_URL} target="_blank" rel="noopener noreferrer" className="hover:text-[var(--color-text-primary)] transition-colors">GitHub</a>
      </nav>
      <Button variant="primary" size="md" onClick={onOpen} className="group">
        Open editor
        <ArrowRight size={16} className="ml-1.5 transition-transform group-hover:translate-x-0.5" />
      </Button>
    </div>
  </header>
);

/* ---------------------------------------------------------------- Hero --- */

const Hero: React.FC<{ onOpen: () => void }> = ({ onOpen }) => (
  <section id="top" className="relative pt-36 pb-24 px-6">
    {/* glow */}
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[900px] h-[900px] rounded-full bg-gradient-to-br from-blue-500/20 via-indigo-500/10 to-transparent blur-3xl" />
    </div>

    <div className="relative max-w-4xl mx-auto text-center">
      <a
        href={REPO_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[var(--color-bg-panel)] border border-[var(--color-border-default)] text-[13px] font-medium text-[var(--color-text-secondary)] mb-8 hover:border-[var(--color-primary)]/40 transition-colors"
      >
        <Sparkle size={14} weight="fill" className="text-[var(--color-primary)]" />
        Free &amp; open source · runs in your browser
      </a>

      <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-[1.05] mb-7">
        Turn your photos into a
        <br className="hidden sm:block" />{' '}
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-indigo-500 to-violet-500">
          cinematic recap
        </span>
      </h1>

      <p className="text-lg md:text-xl text-[var(--color-text-secondary)] max-w-2xl mx-auto leading-relaxed mb-10">
        A browser-based editor that animates your photos into a shareable MP4 — cinematic
        transitions, captions, music, and a real timeline. No upload, no account.
      </p>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-6">
        <Button variant="primary" size="xl" onClick={onOpen} className="px-8 h-14 text-base group w-full sm:w-auto">
          Open the editor
          <ArrowRight size={18} className="ml-2 transition-transform group-hover:translate-x-1" />
        </Button>
        <a href={REPO_URL} target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto">
          <Button variant="secondary" size="xl" className="px-8 h-14 text-base w-full border">
            <GithubLogo size={18} weight="fill" className="mr-2" />
            View on GitHub
          </Button>
        </a>
      </div>

      <p className="text-[13px] text-[var(--color-text-muted)] flex items-center justify-center gap-4 flex-wrap">
        <span className="inline-flex items-center gap-1.5"><Check size={14} weight="bold" className="text-emerald-500" /> No sign-up</span>
        <span className="inline-flex items-center gap-1.5"><Check size={14} weight="bold" className="text-emerald-500" /> 1080p MP4</span>
        <span className="inline-flex items-center gap-1.5"><Check size={14} weight="bold" className="text-emerald-500" /> 100% private</span>
      </p>
    </div>

    <div className="relative max-w-5xl mx-auto mt-16">
      <EditorMock />
    </div>
  </section>
);

/* Stylised editor preview built from the real UI language. */
const EditorMock: React.FC = () => (
  <div className="rounded-2xl border border-[var(--color-border-default)] bg-[var(--color-bg-surface)] shadow-2xl shadow-black/20 overflow-hidden">
    {/* window bar */}
    <div className="h-10 px-4 flex items-center justify-between border-b border-[var(--color-border-default)] bg-[var(--color-bg-panel)]">
      <div className="flex items-center gap-2">
        <span className="w-3 h-3 rounded-full bg-red-400" />
        <span className="w-3 h-3 rounded-full bg-amber-400" />
        <span className="w-3 h-3 rounded-full bg-emerald-400" />
      </div>
      <span className="text-[11px] font-medium text-[var(--color-text-muted)]">reecap.app — editor</span>
      <FilmStrip size={16} className="text-[var(--color-text-muted)]" />
    </div>

    <div className="flex h-[300px] sm:h-[380px]">
      {/* left rail */}
      <div className="w-12 shrink-0 border-r border-[var(--color-border-default)] bg-[var(--color-bg-panel)] flex flex-col items-center py-3 gap-4 text-[var(--color-text-muted)]">
        <ImageIcon size={18} /><MusicNotes size={18} /><TextT size={18} /><Stack size={18} />
      </div>

      {/* canvas */}
      <div className="flex-1 relative flex items-center justify-center bg-[var(--color-bg-page)] p-6">
        <div className="relative w-full max-w-md aspect-video rounded-lg overflow-hidden bg-gradient-to-br from-blue-500 via-indigo-500 to-violet-600 shadow-xl">
          <div className="absolute inset-0 bg-black/10" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-14 h-14 rounded-full bg-white/15 backdrop-blur-md border border-white/30 flex items-center justify-center">
              <Play size={22} weight="fill" className="text-white ml-0.5" />
            </div>
          </div>
          <span className="absolute bottom-3 left-1/2 -translate-x-1/2 text-white font-semibold text-sm drop-shadow-lg">
            Our week, in motion
          </span>
        </div>
      </div>

      {/* right panel */}
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
        <MockField label="Padding" value="24px" fill={0.3} />
      </div>
    </div>

    {/* timeline */}
    <div className="h-20 border-t border-[var(--color-border-default)] bg-[var(--color-bg-panel)] flex items-center gap-2 px-4 overflow-hidden">
      {['from-rose-400 to-orange-400', 'from-sky-400 to-blue-500', 'from-emerald-400 to-teal-500', 'from-violet-400 to-fuchsia-500', 'from-amber-400 to-yellow-500', 'from-indigo-400 to-blue-600'].map((g, i) => (
        <div key={i} className={`h-12 w-20 shrink-0 rounded-md bg-gradient-to-br ${g} ${i === 0 ? 'ring-2 ring-[var(--color-primary)] ring-offset-2 ring-offset-[var(--color-bg-panel)]' : 'opacity-80'}`} />
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
    <div className="max-w-5xl mx-auto px-6 py-5 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
      {[
        { icon: <ShieldCheck size={18} weight="fill" />, label: 'No upload' },
        { icon: <Lightning size={18} weight="fill" />, label: 'WebCodecs export' },
        { icon: <FilmStrip size={18} weight="fill" />, label: '8 transitions' },
        { icon: <DownloadSimple size={18} weight="fill" />, label: 'MP4 in seconds' },
      ].map((b) => (
        <div key={b.label} className="flex items-center justify-center gap-2 text-[13px] font-medium text-[var(--color-text-secondary)]">
          <span className="text-[var(--color-primary)]">{b.icon}</span>
          {b.label}
        </div>
      ))}
    </div>
  </section>
);

/* --------------------------------------------------------------- Steps --- */

const Steps: React.FC = () => (
  <section id="how" className="max-w-5xl mx-auto px-6 py-24">
    <SectionHeading eyebrow="How it works" title="From camera roll to MP4 in three steps" />
    <div className="grid md:grid-cols-3 gap-6 mt-14">
      {[
        { n: '01', icon: <ImageIcon size={24} weight="duotone" />, title: 'Upload', body: 'Drag in 2–30 photos — JPG, PNG, or WebP. Reorder them on the timeline.' },
        { n: '02', icon: <Sliders size={24} weight="duotone" />, title: 'Customize', body: 'Pick transitions, per-slide timing, captions, background, and music.' },
        { n: '03', icon: <DownloadSimple size={24} weight="duotone" />, title: 'Export', body: 'Render a crisp 1080p MP4 with every transition and animation baked in.' },
      ].map((s) => (
        <div key={s.n} className="relative p-7 rounded-2xl bg-[var(--color-bg-surface)] border border-[var(--color-border-default)]">
          <span className="absolute top-6 right-6 text-3xl font-bold text-[var(--color-border-default)] tabular-nums">{s.n}</span>
          <div className="w-12 h-12 rounded-xl bg-[var(--color-primary)]/10 text-[var(--color-primary)] flex items-center justify-center mb-5">
            {s.icon}
          </div>
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
    <div className="max-w-6xl mx-auto px-6 py-24">
      <SectionHeading eyebrow="Everything you need" title="A focused editor, not a fixed slideshow" />
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-14">
        {FEATURES.map((f) => (
          <div key={f.title} className="group p-7 rounded-2xl bg-[var(--color-bg-surface)] border border-[var(--color-border-default)] hover:border-[var(--color-primary)]/40 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-[var(--color-primary)]/10 text-[var(--color-primary)] flex items-center justify-center mb-5 group-hover:scale-105 transition-transform">
              {f.icon}
            </div>
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
  <section className="max-w-6xl mx-auto px-6 py-24 grid lg:grid-cols-2 gap-14 items-center">
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
      <div className="absolute -inset-6 bg-gradient-to-br from-blue-500/15 to-violet-500/10 blur-2xl rounded-full" />
      <div className="relative grid grid-cols-2 gap-4">
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
    <div className="max-w-5xl mx-auto px-6 py-16 text-center">
      <p className="text-[13px] font-semibold uppercase tracking-[0.1em] text-[var(--color-text-muted)] mb-6">Every aspect ratio</p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        {['16:9', '9:16', '1:1', '4:3', '5:4'].map((r) => (
          <span key={r} className="px-5 py-2.5 rounded-full border border-[var(--color-border-default)] bg-[var(--color-bg-surface)] text-sm font-bold tabular-nums">
            {r}
          </span>
        ))}
      </div>
    </div>
  </section>
);

/* ------------------------------------------------------------- Privacy --- */

const Privacy: React.FC = () => (
  <section id="privacy" className="max-w-4xl mx-auto px-6 py-24 text-center">
    <div className="w-16 h-16 mx-auto rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mb-7">
      <ShieldCheck size={32} weight="duotone" />
    </div>
    <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-5">Your photos never leave your device</h2>
    <p className="text-lg text-[var(--color-text-secondary)] leading-relaxed max-w-2xl mx-auto">
      Reecap runs entirely in your browser. Rendering, encoding, and export all happen on your
      machine — no servers, no accounts, no tracking. Close the tab and nothing is left behind.
    </p>
  </section>
);

/* ----------------------------------------------------------- Final CTA --- */

const FinalCTA: React.FC<{ onOpen: () => void }> = ({ onOpen }) => (
  <section className="px-6 pb-24">
    <div className="relative max-w-5xl mx-auto rounded-3xl overflow-hidden border border-[var(--color-border-default)] bg-gradient-to-br from-blue-600 to-indigo-700 px-8 py-16 text-center">
      <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_30%_20%,white,transparent_40%)]" />
      <div className="relative">
        <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-white mb-4">Make your first recap now</h2>
        <p className="text-blue-100 text-lg mb-9 max-w-xl mx-auto">Free, open source, and ready in your browser. No account required.</p>
        <button
          onClick={onOpen}
          className="inline-flex items-center gap-2 px-8 h-14 rounded-xl bg-white text-blue-700 font-bold text-base shadow-xl hover:scale-[1.02] active:scale-95 transition-transform"
        >
          Open the editor
          <ArrowRight size={18} weight="bold" />
        </button>
      </div>
    </div>
  </section>
);

/* -------------------------------------------------------------- Footer --- */

const Footer: React.FC = () => (
  <footer className="border-t border-[var(--color-border-default)]">
    <div className="max-w-6xl mx-auto px-6 py-12 flex flex-col md:flex-row items-center justify-between gap-6">
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
          <FilmStrip size={16} weight="fill" className="text-white" />
        </div>
        <span className="font-bold">Reecap</span>
        <span className="text-[var(--color-text-muted)] text-sm">· Your week, in motion.</span>
      </div>
      <div className="flex items-center gap-5 text-[var(--color-text-muted)]">
        <a href={REPO_URL} target="_blank" rel="noopener noreferrer" className="hover:text-[var(--color-text-primary)] transition-colors"><GithubLogo size={20} /></a>
        <a href="https://x.com/rakibulism" target="_blank" rel="noopener noreferrer" className="hover:text-[var(--color-text-primary)] transition-colors"><TwitterLogo size={20} /></a>
        <span className="text-sm">MIT Licensed</span>
      </div>
    </div>
  </footer>
);

/* -------------------------------------------------------------- shared --- */

const SectionHeading: React.FC<{ eyebrow: string; title: string; align?: 'center' | 'left' }> = ({ eyebrow, title, align = 'center' }) => (
  <div className={align === 'center' ? 'text-center max-w-2xl mx-auto' : 'max-w-xl'}>
    <p className="text-[13px] font-semibold uppercase tracking-[0.1em] text-[var(--color-primary)] mb-3">{eyebrow}</p>
    <h2 className="text-3xl md:text-4xl font-bold tracking-tight leading-tight">{title}</h2>
  </div>
);

export default Landing;
