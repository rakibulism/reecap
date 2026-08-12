import React, { useState } from 'react';
import { X, Crown, Check, ShieldCheck, MusicNotes, Lightning, Stack, RocketLaunch } from 'phosphor-react';
import { useReecapStore } from '../../store/reecapStore';
import { openCheckout } from '../../lib/lemonsqueezy';
import { TIER_LIMITS } from '../../lib/credits';

type PlanKey = 'creator' | 'pro';

const VARIANT_IDS: Record<PlanKey, string> = {
  creator: import.meta.env.VITE_LS_VARIANT_CREATOR as string,
  pro: import.meta.env.VITE_LS_VARIANT_PRO as string,
};

const PLANS: Record<PlanKey, { price: string; cadence: string; sub: string }> = {
  creator: { price: '$9', cadence: '/mo', sub: '50 renders/mo · 1080p · no watermark' },
  pro: { price: '$29', cadence: '/mo', sub: '300 renders/mo · 4K · priority-ready' },
};

const PERKS: Record<PlanKey, { icon: React.ReactNode; label: string }[]> = {
  creator: [
    { icon: <MusicNotes size={16} weight="fill" />, label: 'No watermark on exports' },
    { icon: <Stack size={16} weight="fill" />, label: '1080p HD export, up to 10s' },
    { icon: <Lightning size={16} weight="fill" />, label: '50 renders every month' },
  ],
  pro: [
    { icon: <RocketLaunch size={16} weight="fill" />, label: '4K export, up to 30s' },
    { icon: <Stack size={16} weight="fill" />, label: '300 renders every month' },
    { icon: <Lightning size={16} weight="fill" />, label: 'Everything in Creator' },
  ],
};

const PremiumModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const { isPremium, user, profile, session } = useReecapStore();
  const [plan, setPlan] = useState<PlanKey>('creator');
  const [launching, setLaunching] = useState(false);

  if (!isOpen) return null;

  const close = () => onClose();

  const checkout = async () => {
    if (!session?.user) return;
    setLaunching(true);
    await openCheckout({
      variantId: VARIANT_IDS[plan],
      userId: session.user.id,
      tier: plan,
      email: session.user.email ?? undefined,
      onClose: () => setLaunching(false),
    });
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

  // --- Already subscribed: manage view -------------------------------------
  if (isPremium) {
    const tierLabel = profile ? TIER_LIMITS[profile.tier].label : 'Pro';
    return (
      <Shell>
        <div className="p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-11 h-11 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white shadow-sm">
              <Crown size={22} weight="fill" />
            </div>
            <div>
              <h2 className="text-[17px] font-bold tracking-tight">You're on Reecap {tierLabel}</h2>
              <p className="text-[12px] text-[var(--color-text-muted)]">{user ? user.name : ''}</p>
            </div>
          </div>
          <div className="rounded-[var(--radius-md)] border border-[var(--color-border-default)] bg-[var(--color-bg-surface)] p-4 mb-5 text-[13px] text-[var(--color-text-secondary)]">
            {profile ? `${profile.credits_used_this_month} / ${profile.monthly_credits} renders used this month` : ''}
          </div>
          {profile?.lemonsqueezy_customer_portal_url ? (
            <a
              href={profile.lemonsqueezy_customer_portal_url}
              target="_blank"
              rel="noreferrer"
              className="block w-full h-10 rounded-[var(--radius-sm)] border border-[var(--color-border-default)] text-center leading-10 text-[13px] font-semibold text-[var(--color-text-primary)] hover:bg-[var(--color-bg-hover)] transition-colors"
            >
              Manage subscription
            </a>
          ) : (
            <p className="text-[11px] text-[var(--color-text-muted)] text-center">
              Manage or cancel your subscription from the receipt email Lemon Squeezy sent you.
            </p>
          )}
        </div>
      </Shell>
    );
  }

  // --- Plans -----------------------------------------------------------------
  return (
    <Shell wide>
      <div className="p-6">
        <div className="flex items-center gap-2 mb-1">
          <Crown size={18} weight="fill" className="text-[var(--color-primary)]" />
          <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--color-primary)]">Reecap</span>
        </div>
        <h2 className="text-[20px] font-bold tracking-tight mb-1">Upgrade your plan</h2>
        <p className="text-[13px] text-[var(--color-text-secondary)] mb-5">Choose a plan to unlock more renders and higher resolution.</p>

        <div className="flex p-1 rounded-[var(--radius-md)] bg-[var(--color-bg-surface)] border border-[var(--color-border-default)] mb-5">
          {(['creator', 'pro'] as PlanKey[]).map((p) => (
            <button
              key={p}
              onClick={() => setPlan(p)}
              className={`flex-1 h-9 rounded-[var(--radius-sm)] text-[13px] font-semibold transition-all
                ${plan === p ? 'bg-[var(--color-bg-panel)] text-[var(--color-text-primary)] shadow-[var(--shadow-xs)]' : 'text-[var(--color-text-muted)]'}`}
            >
              {TIER_LIMITS[p].label}
            </button>
          ))}
        </div>

        <div className="flex items-end gap-1 mb-5">
          <span className="text-4xl font-bold tracking-tight">{PLANS[plan].price}</span>
          <span className="text-[var(--color-text-muted)] text-[14px] mb-1.5">{PLANS[plan].cadence}</span>
          <span className="ml-auto text-[11px] text-[var(--color-text-muted)] mb-1.5">{PLANS[plan].sub}</span>
        </div>

        <div className="rounded-[var(--radius-md)] border border-[var(--color-border-default)] bg-[var(--color-bg-surface)] p-4 mb-6">
          <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--color-text-muted)] mb-3">
            Everything in {TIER_LIMITS[plan].label}
          </p>
          <ul className="space-y-2.5">
            {PERKS[plan].map((p) => (
              <li key={p.label} className="flex items-center gap-3 text-[13px] text-[var(--color-text-secondary)]">
                <span className="text-[var(--color-primary)] shrink-0">{p.icon}</span>
                {p.label}
              </li>
            ))}
          </ul>
        </div>

        <div className="flex items-start gap-2.5 rounded-[var(--radius-md)] bg-[var(--color-bg-surface)] border border-[var(--color-border-default)] p-3 mb-5">
          <ShieldCheck size={18} weight="fill" className="text-emerald-500 shrink-0 mt-0.5" />
          <p className="text-[11px] text-[var(--color-text-secondary)] leading-relaxed">
            You'll complete payment securely via Lemon Squeezy. Your plan updates automatically once payment succeeds.
          </p>
        </div>

        <button
          onClick={checkout}
          disabled={launching || !session}
          className="w-full h-11 rounded-[var(--radius-sm)] bg-[var(--color-primary)] text-white font-semibold text-[14px] hover:opacity-90 transition-opacity disabled:opacity-60 flex items-center justify-center gap-2"
        >
          {launching ? (
            <>
              <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              Opening checkout…
            </>
          ) : (
            <>
              <Check size={16} weight="bold" /> Continue to checkout
            </>
          )}
        </button>
        {!session && (
          <p className="mt-3 text-[10px] text-[var(--color-text-muted)] text-center">Sign in first to upgrade.</p>
        )}
      </div>
    </Shell>
  );
};

export default PremiumModal;
