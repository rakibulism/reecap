import React, { useState } from 'react';
import { X, Crown, Check, ShieldCheck, Sparkle, CaretLeft, MusicNotes, Lightning, Stack, RocketLaunch } from 'phosphor-react';
import { useReecapStore } from '../../store/reecapStore';

type Billing = 'monthly' | 'yearly';
type Step = 'plans' | 'checkout' | 'success';

const PLANS: Record<Billing, { price: string; cadence: string; sub: string; total: string }> = {
  monthly: { price: '$9', cadence: '/mo', sub: 'Billed monthly · cancel anytime', total: '$9.00 today' },
  yearly: { price: '$6', cadence: '/mo', sub: 'Billed $72/yr · save 33%', total: '$72.00 today' },
};

const PERKS: { icon: React.ReactNode; label: string }[] = [
  { icon: <MusicNotes size={16} weight="fill" />, label: '10,000+ premium music tracks' },
  { icon: <RocketLaunch size={16} weight="fill" />, label: '4K export with no watermark' },
  { icon: <Stack size={16} weight="fill" />, label: 'Unlimited projects & cloud sync' },
  { icon: <Lightning size={16} weight="fill" />, label: 'Priority access to new features' },
  { icon: <Sparkle size={16} weight="fill" />, label: 'Premium templates & assets' },
];

const PremiumModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const { isPremium, user, subscribePremium, cancelPremium } = useReecapStore();
  const [step, setStep] = useState<Step>('plans');
  const [billing, setBilling] = useState<Billing>('yearly');
  const [processing, setProcessing] = useState(false);

  if (!isOpen) return null;

  const close = () => {
    onClose();
    // Reset after the close animation so reopening starts fresh.
    setTimeout(() => setStep('plans'), 200);
  };

  const confirm = () => {
    setProcessing(true);
    // Simulate a brief processing step (demo — no real payment is taken).
    setTimeout(() => {
      subscribePremium();
      setProcessing(false);
      setStep('success');
    }, 900);
  };

  const Shell: React.FC<{ children: React.ReactNode; wide?: boolean }> = ({ children, wide }) => (
    <div className="fixed inset-0 z-[4000] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/45 backdrop-blur-sm animate-in fade-in" onClick={close} />
      <div className={`relative w-full ${wide ? 'max-w-lg' : 'max-w-md'} rounded-[var(--radius-lg)] bg-[var(--color-bg-panel)] border border-[var(--color-border-default)] shadow-[var(--shadow-md)] overflow-hidden animate-in fade-in zoom-in-95 duration-200`}>
        <button
          onClick={close}
          className="absolute top-4 right-4 z-10 p-1.5 rounded-[var(--radius-sm)] text-[var(--color-text-muted)] hover:bg-[var(--color-bg-hover)] hover:text-[var(--color-text-primary)]"
        >
          <X size={18} />
        </button>
        {children}
      </div>
    </div>
  );

  const PerkList = () => (
    <ul className="space-y-2.5">
      {PERKS.map((p) => (
        <li key={p.label} className="flex items-center gap-3 text-[13px] text-[var(--color-text-secondary)]">
          <span className="text-[var(--color-primary)] shrink-0">{p.icon}</span>
          {p.label}
        </li>
      ))}
    </ul>
  );

  // --- Already subscribed: manage view -------------------------------------
  if (isPremium && step !== 'success') {
    return (
      <Shell>
        <div className="p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-11 h-11 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white shadow-sm">
              <Crown size={22} weight="fill" />
            </div>
            <div>
              <h2 className="text-[17px] font-bold tracking-tight">You're on Reecap Pro</h2>
              <p className="text-[12px] text-[var(--color-text-muted)]">Premium is active{user ? ` · ${user.name}` : ''}</p>
            </div>
          </div>
          <div className="rounded-[var(--radius-md)] border border-[var(--color-border-default)] bg-[var(--color-bg-surface)] p-4 mb-5">
            <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--color-text-muted)] mb-3">Your perks</p>
            <PerkList />
          </div>
          <button
            onClick={() => { cancelPremium(); close(); }}
            className="w-full h-10 rounded-[var(--radius-sm)] border border-[var(--color-border-default)] text-[13px] font-semibold text-red-500 hover:bg-red-500/10 transition-colors"
          >
            Cancel subscription
          </button>
          <p className="mt-3 text-[10px] text-[var(--color-text-muted)] text-center">Demo subscription — no real billing.</p>
        </div>
      </Shell>
    );
  }

  // --- Success -------------------------------------------------------------
  if (step === 'success') {
    return (
      <Shell>
        <div className="p-7 text-center">
          <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white shadow-md mb-5 animate-in zoom-in-50 duration-300">
            <Crown size={32} weight="fill" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight mb-2">Welcome to Pro! 🎉</h2>
          <p className="text-[13px] text-[var(--color-text-secondary)] mb-6 max-w-xs mx-auto">
            Your premium features are unlocked. Enjoy everything Reecap has to offer.
          </p>
          <div className="rounded-[var(--radius-md)] border border-[var(--color-border-default)] bg-[var(--color-bg-surface)] p-4 text-left mb-6">
            <PerkList />
          </div>
          <button
            onClick={close}
            className="w-full h-11 rounded-[var(--radius-sm)] bg-[var(--color-primary)] text-white font-semibold text-[14px] hover:opacity-90 transition-opacity"
          >
            Start creating
          </button>
        </div>
      </Shell>
    );
  }

  // --- Step 1: plans -------------------------------------------------------
  if (step === 'plans') {
    return (
      <Shell wide>
        <div className="p-6">
          <div className="flex items-center gap-2 mb-1">
            <Crown size={18} weight="fill" className="text-[var(--color-primary)]" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--color-primary)]">Reecap Pro</span>
          </div>
          <h2 className="text-[20px] font-bold tracking-tight mb-1">Upgrade to Premium</h2>
          <p className="text-[13px] text-[var(--color-text-secondary)] mb-5">Unlock the full studio. Choose a plan to continue.</p>

          {/* Billing toggle */}
          <div className="flex p-1 rounded-[var(--radius-md)] bg-[var(--color-bg-surface)] border border-[var(--color-border-default)] mb-5">
            {(['monthly', 'yearly'] as Billing[]).map((b) => (
              <button
                key={b}
                onClick={() => setBilling(b)}
                className={`flex-1 h-9 rounded-[var(--radius-sm)] text-[13px] font-semibold transition-all flex items-center justify-center gap-1.5
                  ${billing === b ? 'bg-[var(--color-bg-panel)] text-[var(--color-text-primary)] shadow-[var(--shadow-xs)]' : 'text-[var(--color-text-muted)]'}`}
              >
                {b === 'monthly' ? 'Monthly' : 'Yearly'}
                {b === 'yearly' && <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-500">-33%</span>}
              </button>
            ))}
          </div>

          <div className="flex items-end gap-1 mb-5">
            <span className="text-4xl font-bold tracking-tight">{PLANS[billing].price}</span>
            <span className="text-[var(--color-text-muted)] text-[14px] mb-1.5">{PLANS[billing].cadence}</span>
            <span className="ml-auto text-[11px] text-[var(--color-text-muted)] mb-1.5">{PLANS[billing].sub}</span>
          </div>

          <div className="rounded-[var(--radius-md)] border border-[var(--color-border-default)] bg-[var(--color-bg-surface)] p-4 mb-6">
            <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--color-text-muted)] mb-3">Everything in Pro</p>
            <PerkList />
          </div>

          <button
            onClick={() => setStep('checkout')}
            className="w-full h-11 rounded-[var(--radius-sm)] bg-[var(--color-primary)] text-white font-semibold text-[14px] hover:opacity-90 transition-opacity"
          >
            Continue
          </button>
          <p className="mt-3 text-[10px] text-[var(--color-text-muted)] text-center">Demo checkout — no real payment is taken.</p>
        </div>
      </Shell>
    );
  }

  // --- Step 2: checkout (demo) ---------------------------------------------
  return (
    <Shell>
      <div className="p-6">
        <button onClick={() => setStep('plans')} className="inline-flex items-center gap-1 text-[12px] font-medium text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] mb-4">
          <CaretLeft size={13} /> Back
        </button>
        <h2 className="text-[18px] font-bold tracking-tight mb-1">Confirm your upgrade</h2>
        <p className="text-[13px] text-[var(--color-text-secondary)] mb-5">Review your plan and confirm to unlock Pro.</p>

        <div className="rounded-[var(--radius-md)] border border-[var(--color-border-default)] bg-[var(--color-bg-surface)] divide-y divide-[var(--color-border-default)] mb-5">
          <div className="flex items-center justify-between px-4 py-3">
            <span className="text-[13px] text-[var(--color-text-secondary)]">Reecap Pro · {billing === 'yearly' ? 'Yearly' : 'Monthly'}</span>
            <span className="text-[13px] font-semibold">{PLANS[billing].price}{PLANS[billing].cadence}</span>
          </div>
          <div className="flex items-center justify-between px-4 py-3">
            <span className="text-[13px] font-bold">Due today</span>
            <span className="text-[14px] font-bold">{PLANS[billing].total}</span>
          </div>
        </div>

        <div className="flex items-start gap-2.5 rounded-[var(--radius-md)] bg-[var(--color-bg-surface)] border border-[var(--color-border-default)] p-3 mb-6">
          <ShieldCheck size={18} weight="fill" className="text-emerald-500 shrink-0 mt-0.5" />
          <p className="text-[11px] text-[var(--color-text-secondary)] leading-relaxed">
            This is a demo. No card details are collected and no real payment is taken — confirming just unlocks Pro features locally.
          </p>
        </div>

        <button
          onClick={confirm}
          disabled={processing}
          className="w-full h-11 rounded-[var(--radius-sm)] bg-[var(--color-primary)] text-white font-semibold text-[14px] hover:opacity-90 transition-opacity disabled:opacity-60 flex items-center justify-center gap-2"
        >
          {processing ? (
            <>
              <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              Processing…
            </>
          ) : (
            <>
              <Check size={16} weight="bold" /> Confirm &amp; Upgrade
            </>
          )}
        </button>
      </div>
    </Shell>
  );
};

export default PremiumModal;
