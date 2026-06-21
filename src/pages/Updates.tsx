import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'phosphor-react';
import SiteLayout from '../components/site/SiteLayout';
import Button from '../components/ui/Button';
import { UPDATES, TAG_LABEL, type UpdateTag } from '../data/updates';

const tagColor: Record<UpdateTag, string> = {
  release: 'bg-blue-500/15 text-blue-500',
  feature: 'bg-emerald-500/15 text-emerald-500',
  improvement: 'bg-violet-500/15 text-violet-500',
  fix: 'bg-amber-500/15 text-amber-600',
};

const fmtDate = (iso: string) =>
  new Date(iso + 'T00:00:00').toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });

const Updates: React.FC = () => {
  const navigate = useNavigate();
  return (
    <SiteLayout>
      <div className="max-w-3xl mx-auto px-5 sm:px-6 py-14 sm:py-20">
        <header className="mb-12">
          <p className="text-[13px] font-semibold uppercase tracking-[0.1em] text-[var(--color-primary)] mb-3">Changelog</p>
          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight mb-4">What's new in Reecap</h1>
          <p className="text-base sm:text-lg text-[var(--color-text-secondary)] leading-relaxed">
            Every notable release, feature, and improvement — newest first.
          </p>
        </header>

        <ol className="relative border-l border-[var(--color-border-default)] ml-1.5">
          {UPDATES.map((u) => (
            <li key={u.id} className="relative pl-7 sm:pl-8 pb-10 last:pb-0">
              <span className="absolute -left-[7px] top-1.5 w-3.5 h-3.5 rounded-full bg-[var(--color-primary)] ring-4 ring-[var(--color-bg-page)]" />
              <div className="flex flex-wrap items-center gap-2.5 mb-2">
                <span className={`text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded ${tagColor[u.tag]}`}>{TAG_LABEL[u.tag]}</span>
                {u.version && <span className="text-[11px] font-bold tabular-nums text-[var(--color-text-secondary)]">{u.version}</span>}
                <span className="text-[12px] text-[var(--color-text-muted)] tabular-nums">{fmtDate(u.date)}</span>
              </div>
              <h2 className="text-lg sm:text-xl font-bold mb-1.5">{u.title}</h2>
              <p className="text-[var(--color-text-secondary)] leading-relaxed">{u.summary}</p>
            </li>
          ))}
        </ol>

        <div className="mt-14 p-6 sm:p-8 rounded-2xl border border-[var(--color-border-default)] bg-[var(--color-bg-panel)]/40 text-center">
          <h3 className="text-xl font-bold mb-2">Ready to try the latest?</h3>
          <p className="text-[var(--color-text-secondary)] mb-5">Jump into the editor — it's all live, no install required.</p>
          <Button variant="primary" size="lg" onClick={() => navigate('/app')} className="group">
            Open the editor
            <ArrowRight size={16} className="ml-1.5 transition-transform group-hover:translate-x-0.5" />
          </Button>
        </div>
      </div>
    </SiteLayout>
  );
};

export default Updates;
