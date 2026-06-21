import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bell, ArrowRight } from 'phosphor-react';
import { UPDATES, LATEST_UPDATE_ID, TAG_LABEL, type UpdateTag } from '../../data/updates';

const SEEN_KEY = 'reecap-seen-update';

const tagColor: Record<UpdateTag, string> = {
  release: 'bg-blue-500/15 text-blue-500',
  feature: 'bg-emerald-500/15 text-emerald-500',
  improvement: 'bg-violet-500/15 text-violet-500',
  fix: 'bg-amber-500/15 text-amber-600',
};

const fmtDate = (iso: string) =>
  new Date(iso + 'T00:00:00').toLocaleDateString(undefined, { month: 'short', day: 'numeric' });

const NotificationBell: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [unread, setUnread] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      setUnread(localStorage.getItem(SEEN_KEY) !== LATEST_UPDATE_ID);
    } catch {
      setUnread(true);
    }
  }, []);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('mousedown', onDown);
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('mousedown', onDown);
      window.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const toggle = () => {
    const next = !open;
    setOpen(next);
    if (next && unread) {
      try { localStorage.setItem(SEEN_KEY, LATEST_UPDATE_ID); } catch { /* ignore */ }
      setUnread(false);
    }
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={toggle}
        aria-label="What's new"
        className="relative w-10 h-10 flex items-center justify-center rounded-[var(--radius-md)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)] hover:text-[var(--color-text-primary)] transition-colors"
      >
        <Bell size={20} weight={unread ? 'fill' : 'regular'} />
        {unread && (
          <span className="absolute top-2 right-2.5 w-2 h-2 rounded-full bg-[var(--color-primary)] ring-2 ring-[var(--color-bg-page)]" />
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-[calc(100vw-2rem)] max-w-sm rounded-2xl border border-[var(--color-border-default)] bg-[var(--color-bg-surface)] shadow-[var(--shadow-md)] z-[3000] overflow-hidden animate-in fade-in zoom-in-95">
          <div className="px-4 py-3 border-b border-[var(--color-border-default)] flex items-center justify-between">
            <span className="text-sm font-bold">What's new</span>
            <span className="text-[11px] font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">Reecap</span>
          </div>

          <div className="max-h-[60vh] overflow-y-auto custom-scrollbar">
            {UPDATES.slice(0, 5).map((u) => (
              <Link
                key={u.id}
                to="/updates"
                onClick={() => setOpen(false)}
                className="block px-4 py-3 border-b border-[var(--color-border-default)] last:border-0 hover:bg-[var(--color-bg-hover)] transition-colors"
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-[10px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded ${tagColor[u.tag]}`}>
                    {TAG_LABEL[u.tag]}
                  </span>
                  <span className="text-[11px] text-[var(--color-text-muted)] tabular-nums">{fmtDate(u.date)}</span>
                </div>
                <p className="text-[13px] font-semibold text-[var(--color-text-primary)] leading-snug">{u.title}</p>
                <p className="text-[12px] text-[var(--color-text-secondary)] leading-relaxed mt-0.5 line-clamp-2">{u.summary}</p>
              </Link>
            ))}
          </div>

          <Link
            to="/updates"
            onClick={() => setOpen(false)}
            className="flex items-center justify-center gap-1.5 px-4 py-3 text-[13px] font-semibold text-[var(--color-primary)] hover:bg-[var(--color-bg-hover)] transition-colors"
          >
            View all updates
            <ArrowRight size={14} weight="bold" />
          </Link>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
