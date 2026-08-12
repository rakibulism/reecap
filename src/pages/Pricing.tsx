import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, ArrowRight, Crown, Sparkle, RocketLaunch } from 'phosphor-react';
import SiteLayout from '../components/site/SiteLayout';
import Button from '../components/ui/Button';
import { useSeo, SITE_URL } from '../lib/seo';
import { useReecapStore } from '../store/reecapStore';
import { openCheckout } from '../lib/lemonsqueezy';
import { TIER_LIMITS } from '../lib/credits';

const VARIANT_IDS = {
  creator: import.meta.env.VITE_LS_VARIANT_CREATOR as string,
  pro: import.meta.env.VITE_LS_VARIANT_PRO as string,
} as const;

const FREE_FEATURES = [
  '3 video renders / month',
  'Standard Definition export (720p)',
  'Max 3s video duration',
  '"Made with Reecap" watermark',
  'Photo-to-video recap editor, Motion & Design tools',
];

const CREATOR_FEATURES = [
  'Everything in Free, plus:',
  '50 video renders / month',
  'HD export (1080p), up to 10s',
  'No watermark on any export',
];

const PRO_FEATURES = [
  'Everything in Creator, plus:',
  '300 video renders / month',
  'Ultra-HD export (4K), up to 30s',
  'Built for agencies & power creators',
];

const FAQ = [
  { q: 'Is Reecap free?', a: 'Yes. You get 3 video renders a month at 720p on the Free plan, plus full access to the editor, Motion Design and the Design tool. Creator and Pro raise your render limit, resolution and duration caps, and remove the watermark.' },
  { q: 'Do I need an account?', a: 'A free account is required to track your monthly render usage. Your media itself never leaves your device — rendering happens entirely in your browser.' },
  { q: 'Can I cancel anytime?', a: 'Yes. Creator and Pro are billed monthly and you can cancel anytime from your Lemon Squeezy receipt email — you keep access until the end of your billing period.' },
  { q: 'What happens to my projects if I downgrade?', a: 'Your work stays yours. Only render limits, export resolution/duration and the watermark change based on your active plan.' },
];

const Pricing: React.FC = () => {
  const navigate = useNavigate();
  const { session, openPremiumPrompt } = useReecapStore();
  const [launching, setLaunching] = useState<'creator' | 'pro' | null>(null);

  useSeo({
    title: 'Pricing — Free, Creator & Pro | Reecap',
    description: 'Reecap pricing: Free (3 renders/mo, 720p), Creator ($9–12/mo, 50 renders, 1080p, no watermark) and Pro ($29/mo, 300 renders, 4K).',
    path: '/pricing',
    keywords: ['reecap pricing', 'reecap pro', 'reecap creator', 'free video editor pricing'],
    jsonLd: [
      {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: FAQ.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
      },
      {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: 'Reecap',
        description: 'Usage-based video recap tool with Free, Creator and Pro tiers.',
        url: `${SITE_URL}/pricing`,
        offers: [
          { '@type': 'Offer', price: '0', priceCurrency: 'USD', name: 'Free' },
          { '@type': 'Offer', price: '9', priceCurrency: 'USD', name: 'Creator' },
          { '@type': 'Offer', price: '29', priceCurrency: 'USD', name: 'Pro' },
        ],
      },
    ],
  });

  const upgrade = async (plan: 'creator' | 'pro') => {
    if (!session?.user) {
      openPremiumPrompt();
      return;
    }
    setLaunching(plan);
    await openCheckout({
      variantId: VARIANT_IDS[plan],
      userId: session.user.id,
      tier: plan,
      email: session.user.email ?? undefined,
      onClose: () => setLaunching(null),
    });
  };

  return (
    <SiteLayout>
      <section className="max-w-6xl mx-auto px-5 sm:px-6 py-14 sm:py-20">
        <header className="text-center max-w-2xl mx-auto mb-10">
          <p className="text-[13px] font-semibold uppercase tracking-[0.1em] text-[var(--color-primary)] mb-3">Pricing</p>
          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight mb-4">Start free. Scale as you render more.</h1>
          <p className="text-base sm:text-lg text-[var(--color-text-secondary)] leading-relaxed">
            Reecap is a usage-based plan built around video renders — pick the tier that matches how much you ship.
          </p>
        </header>

        <div className="grid md:grid-cols-3 gap-5 max-w-5xl mx-auto">
          {/* Free */}
          <div className="p-6 sm:p-8 rounded-2xl bg-[var(--color-bg-surface)] border border-[var(--color-border-default)] flex flex-col">
            <h2 className="text-lg font-bold">{TIER_LIMITS.free.label}</h2>
            <p className="text-[var(--color-text-muted)] text-[13px] mt-1">Casual testers & trial users</p>
            <div className="mt-5 mb-6">
              <span className="text-4xl font-bold tracking-tight">$0</span>
              <span className="text-[var(--color-text-muted)] text-[14px] ml-1">/ month</span>
            </div>
            <Button variant="secondary" size="lg" onClick={() => navigate('/app')} className="w-full border mb-6">
              Open the editor
            </Button>
            <ul className="space-y-3">
              {FREE_FEATURES.map((f) => (
                <li key={f} className="flex items-start gap-2.5 text-[14px] text-[var(--color-text-secondary)]">
                  <Check size={16} weight="bold" className="text-emerald-500 mt-0.5 shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
          </div>

          {/* Creator */}
          <div className="relative p-6 sm:p-8 rounded-2xl bg-[var(--color-bg-surface)] border-2 border-[var(--color-primary)] flex flex-col shadow-[var(--shadow-md)]">
            <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-[var(--color-primary)] text-white text-[11px] font-bold uppercase tracking-wide flex items-center gap-1">
              <Sparkle size={12} weight="fill" /> Sweet spot
            </span>
            <div className="flex items-center gap-2">
              <Crown size={20} weight="fill" className="text-amber-500" />
              <h2 className="text-lg font-bold">{TIER_LIMITS.creator.label}</h2>
            </div>
            <p className="text-[var(--color-text-muted)] text-[13px] mt-1">Solo builders & indie creators</p>
            <div className="mt-5 mb-1">
              <span className="text-4xl font-bold tracking-tight">$9–12</span>
              <span className="text-[var(--color-text-muted)] text-[14px] ml-1">/ mo</span>
            </div>
            <p className="text-[12px] text-[var(--color-text-muted)] mb-5">Billed monthly · cancel anytime</p>
            <Button
              variant="primary"
              size="lg"
              onClick={() => upgrade('creator')}
              disabled={launching === 'creator'}
              className="w-full mb-6 group"
            >
              {launching === 'creator' ? 'Opening checkout…' : 'Start with Creator'}
              <ArrowRight size={16} className="ml-1.5 transition-transform group-hover:translate-x-0.5" />
            </Button>
            <ul className="space-y-3">
              {CREATOR_FEATURES.map((f, i) => (
                <li key={f} className={`flex items-start gap-2.5 text-[14px] ${i === 0 ? 'font-semibold text-[var(--color-text-primary)]' : 'text-[var(--color-text-secondary)]'}`}>
                  {i !== 0 && <Check size={16} weight="bold" className="text-[var(--color-primary)] mt-0.5 shrink-0" />}
                  {f}
                </li>
              ))}
            </ul>
          </div>

          {/* Pro */}
          <div className="p-6 sm:p-8 rounded-2xl bg-[var(--color-bg-surface)] border border-[var(--color-border-default)] flex flex-col">
            <div className="flex items-center gap-2">
              <RocketLaunch size={20} weight="fill" className="text-[var(--color-primary)]" />
              <h2 className="text-lg font-bold">{TIER_LIMITS.pro.label}</h2>
            </div>
            <p className="text-[var(--color-text-muted)] text-[13px] mt-1">Agencies & power creators</p>
            <div className="mt-5 mb-1">
              <span className="text-4xl font-bold tracking-tight">$29</span>
              <span className="text-[var(--color-text-muted)] text-[14px] ml-1">/ mo</span>
            </div>
            <p className="text-[12px] text-[var(--color-text-muted)] mb-5">Billed monthly · cancel anytime</p>
            <Button
              variant="secondary"
              size="lg"
              onClick={() => upgrade('pro')}
              disabled={launching === 'pro'}
              className="w-full border mb-6"
            >
              {launching === 'pro' ? 'Opening checkout…' : 'Start with Pro'}
            </Button>
            <ul className="space-y-3">
              {PRO_FEATURES.map((f, i) => (
                <li key={f} className={`flex items-start gap-2.5 text-[14px] ${i === 0 ? 'font-semibold text-[var(--color-text-primary)]' : 'text-[var(--color-text-secondary)]'}`}>
                  {i !== 0 && <Check size={16} weight="bold" className="text-[var(--color-primary)] mt-0.5 shrink-0" />}
                  {f}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* FAQ */}
        <div className="max-w-2xl mx-auto mt-16 sm:mt-20">
          <h2 className="text-2xl font-bold tracking-tight text-center mb-8">Frequently asked questions</h2>
          <div className="space-y-3">
            {FAQ.map((f) => (
              <details key={f.q} className="group rounded-xl border border-[var(--color-border-default)] bg-[var(--color-bg-surface)] px-5 py-4">
                <summary className="flex items-center justify-between cursor-pointer list-none font-semibold text-[15px]">
                  {f.q}
                  <span className="text-[var(--color-text-muted)] transition-transform group-open:rotate-45 text-xl leading-none">+</span>
                </summary>
                <p className="mt-3 text-[14px] text-[var(--color-text-secondary)] leading-relaxed">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </SiteLayout>
  );
};

export default Pricing;
