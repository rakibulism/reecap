import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, ArrowRight, Crown, Sparkle } from 'phosphor-react';
import SiteLayout from '../components/site/SiteLayout';
import Button from '../components/ui/Button';
import { useSeo, SITE_URL } from '../lib/seo';

type Billing = 'monthly' | 'yearly';

const FREE_FEATURES = [
  'Photo-to-video recap editor',
  'Motion Design tool + Figma import',
  'Infinite-canvas Design tool & Dev mode',
  'Creators community',
  '1080p MP4 export · PNG / SVG design export',
  'All transitions, captions & speed controls',
  '100% private — runs in your browser',
];

const PRO_FEATURES = [
  'Everything in Free, plus:',
  '10,000+ premium music tracks',
  '4K export with no watermark',
  'Unlimited projects & cloud sync',
  'Premium templates & assets',
  'Priority access to new features',
  'Priority support',
];

const FAQ = [
  { q: 'Is Reecap free?', a: 'Yes. The full editor — video recaps, Motion Design, the Design tool and the Creators community — is free and runs entirely in your browser. Pro unlocks premium music, 4K watermark-free export, cloud sync and premium assets.' },
  { q: 'Do I need an account?', a: 'No account is required to use the free tools. Your media never leaves your device. Pro adds optional cloud sync across devices.' },
  { q: 'Can I cancel anytime?', a: 'Yes. Pro is billed monthly or yearly and you can cancel at any time — you keep Pro until the end of your billing period.' },
  { q: 'What happens to my projects if I downgrade?', a: 'Your work stays yours. Projects created while on Pro remain editable; only Pro-exclusive assets and 4K export are gated behind an active subscription.' },
];

const Pricing: React.FC = () => {
  const navigate = useNavigate();
  const [billing, setBilling] = useState<Billing>('yearly');

  useSeo({
    title: 'Pricing — Free & Pro | Reecap',
    description: 'Reecap is free: video recaps, Motion Design, the infinite-canvas Design tool and the Creators community. Go Pro for 10,000+ music tracks, 4K watermark-free export, cloud sync and premium assets.',
    path: '/pricing',
    keywords: ['reecap pricing', 'reecap pro', 'free video editor pricing', 'motion design tool price', 'design tool free'],
    jsonLd: [
      {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: FAQ.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
      },
      {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: 'Reecap Pro',
        description: 'Premium plan for Reecap with 10,000+ music tracks, 4K export, cloud sync and premium assets.',
        url: `${SITE_URL}/pricing`,
        offers: [
          { '@type': 'Offer', price: '0', priceCurrency: 'USD', name: 'Free' },
          { '@type': 'Offer', price: '72', priceCurrency: 'USD', name: 'Pro (yearly)' },
        ],
      },
    ],
  });

  const pro = billing === 'yearly' ? { price: '$6', sub: 'per month, billed $72/yr · save 33%' } : { price: '$9', sub: 'per month, billed monthly' };

  return (
    <SiteLayout>
      <section className="max-w-5xl mx-auto px-5 sm:px-6 py-14 sm:py-20">
        <header className="text-center max-w-2xl mx-auto mb-10">
          <p className="text-[13px] font-semibold uppercase tracking-[0.1em] text-[var(--color-primary)] mb-3">Pricing</p>
          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight mb-4">Free to create. Pro to go further.</h1>
          <p className="text-base sm:text-lg text-[var(--color-text-secondary)] leading-relaxed">
            Every creative tool in Reecap is free and runs in your browser. Upgrade only when you want premium
            music, 4K export and cloud sync.
          </p>
        </header>

        {/* billing toggle */}
        <div className="flex items-center justify-center gap-3 mb-10">
          <div className="flex p-1 bg-[var(--color-bg-panel)] border border-[var(--color-border-default)] rounded-full">
            {(['monthly', 'yearly'] as const).map((b) => (
              <button
                key={b}
                onClick={() => setBilling(b)}
                className={`px-4 h-8 text-[13px] font-semibold rounded-full capitalize transition-colors ${billing === b ? 'bg-[var(--color-bg-surface)] text-[var(--color-text-primary)] shadow-sm' : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]'}`}
              >
                {b}{b === 'yearly' && <span className="ml-1.5 text-[10px] font-bold text-emerald-500">−33%</span>}
              </button>
            ))}
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-5 max-w-3xl mx-auto">
          {/* Free */}
          <div className="p-6 sm:p-8 rounded-2xl bg-[var(--color-bg-surface)] border border-[var(--color-border-default)] flex flex-col">
            <h2 className="text-lg font-bold">Free</h2>
            <p className="text-[var(--color-text-muted)] text-[13px] mt-1">For everyone, forever</p>
            <div className="mt-5 mb-6">
              <span className="text-4xl font-bold tracking-tight">$0</span>
              <span className="text-[var(--color-text-muted)] text-[14px] ml-1">/ forever</span>
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

          {/* Pro */}
          <div className="relative p-6 sm:p-8 rounded-2xl bg-[var(--color-bg-surface)] border-2 border-[var(--color-primary)] flex flex-col shadow-[var(--shadow-md)]">
            <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-[var(--color-primary)] text-white text-[11px] font-bold uppercase tracking-wide flex items-center gap-1">
              <Sparkle size={12} weight="fill" /> Most popular
            </span>
            <div className="flex items-center gap-2">
              <Crown size={20} weight="fill" className="text-amber-500" />
              <h2 className="text-lg font-bold">Pro</h2>
            </div>
            <p className="text-[var(--color-text-muted)] text-[13px] mt-1">For creators who ship a lot</p>
            <div className="mt-5 mb-1">
              <span className="text-4xl font-bold tracking-tight">{pro.price}</span>
              <span className="text-[var(--color-text-muted)] text-[14px] ml-1">/ mo</span>
            </div>
            <p className="text-[12px] text-[var(--color-text-muted)] mb-5">{pro.sub}</p>
            <Button variant="primary" size="lg" onClick={() => navigate('/app')} className="w-full mb-6 group">
              Start with Pro
              <ArrowRight size={16} className="ml-1.5 transition-transform group-hover:translate-x-0.5" />
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
