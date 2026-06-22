import React, { useState } from 'react';
import { X, Gift, Copy, Check, TwitterLogo, WhatsappLogo, EnvelopeSimple, MusicNotes, Sparkle, Crown, UserPlus } from 'phosphor-react';
import { useReecapStore } from '../../store/reecapStore';

const APP_URL = 'https://reecap.vercel.app';
const DAYS_PER_INVITE = 3;
const SHARE_MSG = "I'm using Reecap to turn photos into videos and animate designs — it's free and runs right in the browser. Try it:";

const MILESTONES: { count: number; icon: React.ReactNode; label: string }[] = [
  { count: 1, icon: <MusicNotes size={15} weight="fill" />, label: '3 days of Pro audio' },
  { count: 3, icon: <Sparkle size={15} weight="fill" />, label: 'Premium track pack' },
  { count: 5, icon: <Crown size={15} weight="fill" />, label: '1 month of Reecap Pro' },
];

// A stable, friendly-looking referral code for the session.
function makeCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let s = '';
  for (let i = 0; i < 6; i++) s += chars[Math.floor((i + 1) * 7919 % chars.length)];
  return s;
}

const InviteModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const { inviteCount, addInvite, user } = useReecapStore();
  const [code] = useState(() => (user ? user.name.replace(/[^A-Za-z0-9]/g, '').slice(0, 6).toUpperCase() || makeCode() : makeCode()));
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const link = `${APP_URL}/?ref=${code}`;
  const daysEarned = inviteCount * DAYS_PER_INVITE;
  const nextMilestone = MILESTONES.find((m) => inviteCount < m.count);
  const progress = nextMilestone ? Math.min(1, inviteCount / nextMilestone.count) : 1;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(link);
    } catch {
      /* clipboard may be blocked; the link is still selectable */
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const share = (kind: 'x' | 'whatsapp' | 'email') => {
    const text = encodeURIComponent(SHARE_MSG);
    const url = encodeURIComponent(link);
    const targets = {
      x: `https://x.com/intent/tweet?text=${text}&url=${url}`,
      whatsapp: `https://wa.me/?text=${encodeURIComponent(SHARE_MSG + ' ' + link)}`,
      email: `mailto:?subject=${encodeURIComponent('Try Reecap (free)')}&body=${encodeURIComponent(SHARE_MSG + '\n\n' + link)}`,
    };
    window.open(targets[kind], '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="fixed inset-0 z-[4000] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/45 backdrop-blur-sm animate-in fade-in" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-[var(--radius-lg)] bg-[var(--color-bg-panel)] border border-[var(--color-border-default)] shadow-[var(--shadow-md)] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-1.5 rounded-[var(--radius-sm)] text-[var(--color-text-muted)] hover:bg-[var(--color-bg-hover)] hover:text-[var(--color-text-primary)]"
        >
          <X size={18} />
        </button>

        <div className="p-6">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center text-white shadow-sm">
              <Gift size={20} weight="fill" />
            </div>
            <div>
              <h2 className="text-[17px] font-bold tracking-tight">Invite &amp; Earn Audio</h2>
              <p className="text-[12px] text-[var(--color-text-muted)]">Get {DAYS_PER_INVITE} days of Pro audio for every friend who joins.</p>
            </div>
          </div>

          {/* Referral link */}
          <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--color-text-muted)] mt-5 mb-2">Your invite link</p>
          <div className="flex items-center gap-2">
            <input
              readOnly
              value={link}
              onFocus={(e) => e.currentTarget.select()}
              className="flex-1 min-w-0 h-10 px-3 rounded-[var(--radius-sm)] bg-[var(--color-bg-surface)] border border-[var(--color-border-default)] text-[12px] text-[var(--color-text-secondary)] tabular-nums"
            />
            <button
              onClick={copy}
              className={`h-10 px-3.5 rounded-[var(--radius-sm)] text-[13px] font-semibold flex items-center gap-1.5 transition-colors shrink-0
                ${copied ? 'bg-emerald-500 text-white' : 'bg-[var(--color-primary)] text-white hover:opacity-90'}`}
            >
              {copied ? <><Check size={15} weight="bold" /> Copied</> : <><Copy size={15} /> Copy</>}
            </button>
          </div>

          {/* Share */}
          <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--color-text-muted)] mt-5 mb-2">Share</p>
          <div className="grid grid-cols-3 gap-2">
            {([
              { kind: 'x', icon: <TwitterLogo size={18} weight="fill" />, label: 'X' },
              { kind: 'whatsapp', icon: <WhatsappLogo size={18} weight="fill" />, label: 'WhatsApp' },
              { kind: 'email', icon: <EnvelopeSimple size={18} weight="fill" />, label: 'Email' },
            ] as const).map((s) => (
              <button
                key={s.kind}
                onClick={() => share(s.kind)}
                className="h-10 rounded-[var(--radius-sm)] border border-[var(--color-border-default)] bg-[var(--color-bg-surface)] text-[12px] font-semibold text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:border-[var(--color-text-muted)] transition-colors flex items-center justify-center gap-2"
              >
                {s.icon} {s.label}
              </button>
            ))}
          </div>

          {/* Rewards tracker */}
          <div className="mt-5 rounded-[var(--radius-md)] border border-[var(--color-border-default)] bg-[var(--color-bg-surface)] p-4">
            <div className="flex items-baseline justify-between mb-3">
              <span className="text-[13px] font-bold">{inviteCount} {inviteCount === 1 ? 'friend' : 'friends'} joined</span>
              <span className="text-[12px] font-semibold text-[var(--color-primary)]">{daysEarned} days earned</span>
            </div>
            {nextMilestone && (
              <>
                <div className="h-1.5 rounded-full bg-[var(--color-bg-hover)] overflow-hidden mb-1.5">
                  <div className="h-full rounded-full bg-[var(--color-primary)] transition-all" style={{ width: `${progress * 100}%` }} />
                </div>
                <p className="text-[11px] text-[var(--color-text-muted)] mb-3">
                  {nextMilestone.count - inviteCount} more to unlock <span className="font-semibold text-[var(--color-text-secondary)]">{nextMilestone.label}</span>
                </p>
              </>
            )}
            <ul className="space-y-1.5">
              {MILESTONES.map((m) => {
                const done = inviteCount >= m.count;
                return (
                  <li key={m.count} className={`flex items-center gap-2.5 text-[12px] ${done ? 'text-[var(--color-text-primary)]' : 'text-[var(--color-text-muted)]'}`}>
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${done ? 'bg-emerald-500 text-white' : 'bg-[var(--color-bg-hover)] text-[var(--color-text-muted)]'}`}>
                      {done ? <Check size={12} weight="bold" /> : m.icon}
                    </span>
                    <span className="flex-1">{m.label}</span>
                    <span className="text-[10px] font-bold uppercase tracking-wide tabular-nums">{m.count} {m.count === 1 ? 'friend' : 'friends'}</span>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Demo: simulate a friend accepting the invite */}
          <button
            onClick={addInvite}
            className="w-full mt-4 h-10 rounded-[var(--radius-sm)] border border-dashed border-[var(--color-border-strong)] text-[12px] font-semibold text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)] hover:text-[var(--color-text-primary)] transition-colors flex items-center justify-center gap-2"
          >
            <UserPlus size={15} /> Simulate a friend joining
          </button>
          <p className="mt-3 text-[10px] text-[var(--color-text-muted)] text-center">Demo — referrals are simulated, no audio is actually granted.</p>
        </div>
      </div>
    </div>
  );
};

export default InviteModal;
