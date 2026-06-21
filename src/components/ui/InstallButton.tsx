import React, { useEffect, useState } from 'react';
import { DownloadSimple } from 'phosphor-react';
import { canInstall, isStandalone, promptInstall, subscribeInstall } from '../../lib/pwa';

interface Props {
  /** 'solid' for the landing nav, 'ghost' for the editor topbar. */
  variant?: 'solid' | 'ghost';
  className?: string;
}

/** Always-visible "Install app" button. When the browser exposes the install
 *  prompt, clicking installs Reecap (which launches at /app via the manifest).
 *  Hidden only when already running as an installed app. */
const InstallButton: React.FC<Props> = ({ variant = 'solid', className = '' }) => {
  const [, force] = useState(0);
  const [hint, setHint] = useState(false);

  useEffect(() => subscribeInstall(() => force((n) => n + 1)), []);

  if (isStandalone()) return null; // already installed — nothing to do

  const onClick = async () => {
    const outcome = await promptInstall();
    if (outcome === 'unavailable') {
      // Browser hasn't offered a native prompt (e.g. iOS Safari) — guide the user.
      setHint(true);
      setTimeout(() => setHint(false), 4000);
    }
  };

  const base =
    'inline-flex items-center gap-1.5 font-semibold transition-all rounded-[var(--radius-md)]';
  const styles =
    variant === 'solid'
      ? 'h-10 px-4 text-sm bg-[var(--color-bg-panel)] border border-[var(--color-border-default)] text-[var(--color-text-primary)] hover:border-[var(--color-primary)]/50'
      : 'h-8 px-2.5 text-[13px] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)] hover:text-[var(--color-text-primary)]';

  return (
    <div className="relative">
      <button
        onClick={onClick}
        className={`${base} ${styles} ${className}`}
        title={canInstall() ? 'Install Reecap as an app' : 'Install Reecap'}
      >
        <DownloadSimple size={16} weight="bold" />
        Install app
      </button>
      {hint && (
        <div className="absolute top-full right-0 mt-2 w-60 p-3 rounded-[var(--radius-md)] bg-[var(--color-bg-surface)] border border-[var(--color-border-default)] shadow-[var(--shadow-md)] text-[12px] text-[var(--color-text-secondary)] z-[3000] leading-relaxed">
          To install, use your browser menu and choose <span className="font-semibold text-[var(--color-text-primary)]">“Install app”</span> or <span className="font-semibold text-[var(--color-text-primary)]">“Add to Home Screen.”</span>
        </div>
      )}
    </div>
  );
};

export default InstallButton;
