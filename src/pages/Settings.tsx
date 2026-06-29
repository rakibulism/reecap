import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Palette, FilmSlate } from 'phosphor-react';
import SiteLayout from '../components/site/SiteLayout';
import ThemeToggle from '../components/ui/ThemeToggle';
import VideoSaveLocation from '../components/settings/VideoSaveLocation';
import { useReecapStore } from '../store/reecapStore';
import { useSeo } from '../lib/seo';

/** A labelled card grouping related settings. */
const Section: React.FC<{ icon: React.ElementType; title: string; description?: string; children: React.ReactNode }> = ({
  icon: Icon,
  title,
  description,
  children,
}) => (
  <section className="rounded-[var(--radius-lg)] border border-[var(--color-border-default)] bg-[var(--color-bg-panel)] overflow-hidden">
    <div className="flex items-start gap-3 px-5 sm:px-6 py-5 border-b border-[var(--color-border-default)]">
      <div className="w-9 h-9 rounded-[var(--radius-md)] bg-[var(--color-primary)]/10 text-[var(--color-primary)] flex items-center justify-center shrink-0">
        <Icon size={20} weight="duotone" />
      </div>
      <div>
        <h2 className="text-[15px] font-bold tracking-tight">{title}</h2>
        {description && <p className="text-[13px] text-[var(--color-text-muted)] mt-0.5">{description}</p>}
      </div>
    </div>
    <div className="px-5 sm:px-6 py-5">{children}</div>
  </section>
);

/** A single setting row: label + control side by side. */
const Row: React.FC<{ label: string; hint?: string; children: React.ReactNode }> = ({ label, hint, children }) => (
  <div className="flex items-center justify-between gap-4">
    <div className="min-w-0">
      <div className="text-[14px] font-semibold">{label}</div>
      {hint && <div className="text-[12px] text-[var(--color-text-muted)] mt-0.5">{hint}</div>}
    </div>
    <div className="shrink-0">{children}</div>
  </div>
);

const Settings: React.FC = () => {
  useSeo({
    title: 'Settings — Reecap',
    description: 'Manage your Reecap preferences: appearance theme and where exported videos are saved.',
    path: '/settings',
    keywords: ['reecap settings', 'reecap preferences', 'video save location'],
  });

  const { settings, updateSettings } = useReecapStore();

  return (
    <SiteLayout>
      <div className="max-w-2xl mx-auto px-5 sm:px-6 py-14 sm:py-20">
        <Link
          to="/app"
          className="inline-flex items-center gap-1.5 text-[13px] font-medium text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors mb-6"
        >
          <ArrowLeft size={15} weight="bold" /> Back to editor
        </Link>

        <header className="mb-10">
          <p className="text-[13px] font-semibold uppercase tracking-[0.1em] text-[var(--color-primary)] mb-3">
            Settings
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">Preferences</h1>
          <p className="mt-4 text-[var(--color-text-secondary)] leading-relaxed max-w-xl">
            These apply across Reecap and are saved in this browser.
          </p>
        </header>

        <div className="space-y-6">
          <Section icon={Palette} title="Appearance" description="How Reecap looks on this device.">
            <Row label="Theme" hint="Light, dark, or match your system.">
              <ThemeToggle />
            </Row>
          </Section>

          <Section icon={FilmSlate} title="Video" description="Defaults for exporting your video.">
            <div className="space-y-6">
              <Row label="Export quality" hint="Resolution of the exported MP4.">
                <div className="flex items-center bg-[var(--color-bg-surface)] border border-[var(--color-border-default)] rounded-[var(--radius-sm)] p-1">
                  {(['1x', '2x'] as const).map((q) => (
                    <button
                      key={q}
                      onClick={() => updateSettings({ exportQuality: q })}
                      className={`px-3 h-7 text-[12px] font-semibold rounded-[2px] transition-all
                        ${settings.exportQuality === q
                          ? 'bg-[var(--color-bg-panel)] text-[var(--color-text-primary)] shadow-sm'
                          : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]'}`}
                    >
                      {q === '1x' ? '720p' : '1080p'}
                    </button>
                  ))}
                </div>
              </Row>

              <div className="h-px bg-[var(--color-border-default)]" />

              <div>
                <div className="text-[14px] font-semibold mb-1">Save location</div>
                <p className="text-[12px] text-[var(--color-text-muted)] mb-4">
                  Where exported videos go when you press Export.
                </p>
                <VideoSaveLocation />
              </div>
            </div>
          </Section>
        </div>
      </div>
    </SiteLayout>
  );
};

export default Settings;
