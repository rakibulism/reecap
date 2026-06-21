import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FilmStrip, Monitor, ArrowLeft } from 'phosphor-react';

/** The editor's panels + timeline need room a phone can't offer. On small
 *  screens we show a friendly gate with a "continue anyway" escape hatch. */
const EditorMobileGate: React.FC = () => {
  const [width, setWidth] = useState<number>(typeof window !== 'undefined' ? window.innerWidth : 1024);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const onResize = () => setWidth(window.innerWidth);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  if (width >= 768 || dismissed) return null;

  return (
    <div className="fixed inset-0 z-[5000] bg-[var(--color-bg-page)] flex flex-col items-center justify-center text-center px-7" style={{ paddingTop: 'env(safe-area-inset-top)', paddingBottom: 'env(safe-area-inset-bottom)' }}>
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/25 mb-7">
        <FilmStrip size={32} weight="fill" className="text-white" />
      </div>

      <div className="flex items-center gap-2 text-[var(--color-primary)] mb-3">
        <Monitor size={18} weight="fill" />
        <span className="text-[12px] font-bold uppercase tracking-wider">Best on a bigger screen</span>
      </div>

      <h1 className="text-2xl font-bold tracking-tight mb-3">The editor needs some room</h1>
      <p className="text-[var(--color-text-secondary)] leading-relaxed max-w-sm mb-9">
        Reecap's timeline and side panels are built for tablets and desktops. Open this page on a
        larger screen for the full experience — or continue anyway.
      </p>

      <div className="flex flex-col gap-3 w-full max-w-xs">
        <button
          onClick={() => setDismissed(true)}
          className="h-12 rounded-[var(--radius-md)] bg-[var(--color-primary)] text-white font-semibold active:scale-95 transition-transform"
        >
          Continue anyway
        </button>
        <Link
          to="/"
          className="h-12 rounded-[var(--radius-md)] border border-[var(--color-border-default)] text-[var(--color-text-primary)] font-semibold flex items-center justify-center gap-2"
        >
          <ArrowLeft size={16} /> Back to home
        </Link>
      </div>
    </div>
  );
};

export default EditorMobileGate;
