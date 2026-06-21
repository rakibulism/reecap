import React from 'react';
import { Sun, Moon, Monitor } from 'phosphor-react';
import { useReecapStore } from '../../store/reecapStore';
import type { Theme } from '../../types';

const OPTIONS: { value: Theme | 'system'; icon: React.ElementType; label: string }[] = [
  { value: 'light', icon: Sun, label: 'Light' },
  { value: 'dark', icon: Moon, label: 'Dark' },
  { value: 'system', icon: Monitor, label: 'System' },
];

/** Light / Dark / System theme switcher, bound to the global store. */
const ThemeToggle: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { theme, setTheme } = useReecapStore();
  return (
    <div className={`inline-flex items-center gap-0.5 p-0.5 rounded-[var(--radius-md)] bg-[var(--color-bg-panel)] border border-[var(--color-border-default)] ${className}`}>
      {OPTIONS.map((o) => {
        const active = theme === o.value;
        return (
          <button
            key={o.value}
            onClick={() => setTheme(o.value)}
            aria-label={`${o.label} theme`}
            aria-pressed={active}
            className={`p-1.5 rounded-[var(--radius-sm)] transition-colors ${
              active
                ? 'bg-[var(--color-bg-surface)] text-[var(--color-text-primary)] shadow-[var(--shadow-xs)]'
                : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]'
            }`}
          >
            <o.icon size={15} weight={active ? 'fill' : 'regular'} />
          </button>
        );
      })}
    </div>
  );
};

export default ThemeToggle;
