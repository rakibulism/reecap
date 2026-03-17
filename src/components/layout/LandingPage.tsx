import React from 'react';
import { useReecapStore } from '../../store/reecapStore';
import Button from '../ui/Button';
import { ArrowRight, Sparkle, Image as ImageIcon, MusicNotes, Play } from 'phosphor-react';
import heroBg from '../../assets/landing-hero.png';

const LandingPage: React.FC = () => {
  const { setStarted } = useReecapStore();

  const handleStart = () => {
    setStarted(true);
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg-page)] text-[var(--color-text-primary)] flex flex-col font-sans overflow-x-hidden animate-in fade-in">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 px-8 py-6 flex items-center justify-between backdrop-blur-md bg-[var(--color-bg-page)]/70 border-b border-[var(--color-border-default)]/30">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-[var(--color-primary)] rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Sparkle size={24} weight="fill" className="text-white" />
          </div>
          <span className="text-2xl font-bold tracking-tight">Reecap</span>
        </div>
        <Button variant="primary" size="lg" onClick={handleStart}>
          Open app
        </Button>
      </header>

      {/* Hero Section */}
      <section className="relative pt-44 pb-32 px-8 flex flex-col items-center text-center">
        {/* Decorative background */}
        <div className="absolute inset-0 z-0 opacity-40">
          <img 
            src={heroBg} 
            alt="Hero Background" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[var(--color-bg-page)] via-transparent to-[var(--color-bg-page)]" />
        </div>

        <div className="relative z-10 max-w-4xl w-full">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/20 text-[var(--color-primary)] text-sm font-medium mb-8 animate-in fade-in slide-in-from-bottom-4">
            <Sparkle size={16} weight="fill" />
            <span>Introducing Reecap 1.0</span>
          </div>
          
          <h1 className="text-6xl md:text-8xl font-bold tracking-tight mb-8 leading-[1.1]">
            Turn your memories into <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-indigo-600">stunning recaps</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-[var(--color-text-secondary)] mb-12 max-w-2xl mx-auto leading-relaxed">
            Beautifully crafted photo recaps with cinematic transitions, perfectly synced music, and professional templates.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button variant="primary" size="xl" onClick={handleStart} className="px-10 h-16 text-lg group">
              Open app in browser
              <ArrowRight size={20} className="ml-2 transition-transform group-hover:translate-x-1" />
            </Button>
            <Button variant="secondary" size="xl" className="px-10 h-16 text-lg border-2">
              View Showcase
            </Button>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="px-8 py-32 bg-[var(--color-bg-panel)]/30 border-y border-[var(--color-border-default)]/50">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12">
          <FeatureCard 
            icon={<ImageIcon size={32} weight="duotone" className="text-blue-500" />}
            title="Batch Upload"
            description="Drag and drop your finest photo collections and let Reecap do the heavy lifting."
          />
          <FeatureCard 
            icon={<MusicNotes size={32} weight="duotone" className="text-purple-500" />}
            title="Audio Sync"
            description="Sync your visuals with a curated library of high-fidelity community music."
          />
          <FeatureCard 
            icon={<Play size={32} weight="duotone" className="text-indigo-500" />}
            title="Pro Transitions"
            description="Choose from a variety of smooth, cinematic transitions to tell your story."
          />
        </div>
      </section>

      {/* Mobile Preview / App Screenshot mockup */}
      <section className="px-8 py-32 relative flex flex-col items-center">
        <div className="w-full max-w-5xl aspect-video rounded-3xl bg-[var(--color-bg-surface)] border border-[var(--color-border-default)] shadow-2xl overflow-hidden relative group">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5" />
          <div className="absolute inset-0 flex items-center justify-center">
             <div className="w-24 h-24 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center cursor-pointer hover:scale-110 transition-transform shadow-2xl">
                <Play size={40} weight="fill" className="text-white ml-2" />
             </div>
          </div>
          {/* Mock app status bar */}
          <div className="absolute top-0 left-0 right-0 h-12 bg-[var(--color-bg-page)]/80 backdrop-blur-md border-b border-[var(--color-border-default)] flex items-center px-6 justify-between">
            <div className="flex gap-2">
              <div className="w-3 h-3 rounded-full bg-red-400" />
              <div className="w-3 h-3 rounded-full bg-amber-400" />
              <div className="w-3 h-3 rounded-full bg-emerald-400" />
            </div>
            <div className="text-xs font-medium opacity-50">reecap.app — Editor</div>
            <div className="w-10" />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-8 py-20 border-t border-[var(--color-border-default)] text-center text-[var(--color-text-muted)]">
        <div className="flex items-center justify-center gap-2 mb-6">
          <Sparkle size={20} weight="fill" className="text-[var(--color-primary)]" />
          <span className="text-lg font-bold text-[var(--color-text-primary)]">Reecap</span>
        </div>
        <p className="mb-8">Build stunning stories in seconds.</p>
        <div className="flex items-center justify-center gap-8 text-sm">
          <a href="#" className="hover:text-[var(--color-text-primary)] transition-colors">Privacy</a>
          <a href="#" className="hover:text-[var(--color-text-primary)] transition-colors">Terms</a>
          <a href="#" className="hover:text-[var(--color-text-primary)] transition-colors">Github</a>
        </div>
      </footer>
    </div>
  );
};

const FeatureCard: React.FC<{ icon: React.ReactNode; title: string; description: string }> = ({ icon, title, description }) => (
  <div className="p-8 rounded-3xl bg-[var(--color-bg-surface)] border border-[var(--color-border-default)] shadow-sm hover:shadow-md transition-shadow group">
    <div className="mb-6 p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 w-fit group-hover:scale-110 transition-transform">
      {icon}
    </div>
    <h3 className="text-xl font-bold mb-4">{title}</h3>
    <p className="text-[var(--color-text-secondary)] leading-relaxed">
      {description}
    </p>
  </div>
);

export default LandingPage;
