import React from 'react';
import SiteLayout from '../components/site/SiteLayout';
import { useSeo } from '../lib/seo';

const SUPPORT_EMAIL = '40rakib70@gmail.com';
const LAST_UPDATED = 'August 12, 2026';

const Terms: React.FC = () => {
  useSeo({
    title: 'Terms of Service — Reecap',
    description: 'The terms that govern your use of Reecap, including the Free, Creator and Pro plans.',
    path: '/terms',
    keywords: ['reecap terms', 'reecap terms of service'],
  });

  return (
    <SiteLayout>
      <div className="max-w-3xl mx-auto px-5 sm:px-6 py-14 sm:py-20">
        <header className="mb-10">
          <p className="text-[13px] font-semibold uppercase tracking-[0.1em] text-[var(--color-primary)] mb-3">Legal</p>
          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight">Terms of Service</h1>
          <p className="mt-4 text-[var(--color-text-secondary)]">Last updated: {LAST_UPDATED}</p>
        </header>

        <div className="prose-legal space-y-8 text-[15px] leading-relaxed text-[var(--color-text-secondary)]">
          <section>
            <h2 className="text-lg font-bold text-[var(--color-text-primary)] mb-2">1. Agreement</h2>
            <p>
              These Terms of Service ("Terms") govern your access to and use of Reecap (the "Service"), a
              browser-based video and design tool. By creating an account or using the Service, you agree
              to these Terms. If you do not agree, do not use the Service.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[var(--color-text-primary)] mb-2">2. Plans, credits &amp; billing</h2>
            <p>
              Reecap offers a Free plan and paid Creator and Pro subscription plans, each with a monthly
              limit on video renders and different export resolution, duration and watermark settings, as
              described on our <a href="/pricing" className="text-[var(--color-primary)] hover:underline">Pricing page</a>.
              Paid plans are billed monthly in advance and processed by our payment provider, Lemon Squeezy,
              who acts as merchant of record for these transactions. Render credits reset at the start of
              each monthly billing cycle and do not roll over.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[var(--color-text-primary)] mb-2">3. Cancellation &amp; refunds</h2>
            <p>
              You may cancel a paid subscription at any time; access continues until the end of the current
              billing period, after which your account reverts to the Free plan. Refund requests are handled
              case-by-case — contact us at{' '}
              <a href={`mailto:${SUPPORT_EMAIL}`} className="text-[var(--color-primary)] hover:underline">{SUPPORT_EMAIL}</a>.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[var(--color-text-primary)] mb-2">4. Your content</h2>
            <p>
              Photos, videos, recordings and designs you import into Reecap are processed in your browser.
              You retain all rights to content you create with the Service. You are responsible for ensuring
              you have the right to use any media you import.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[var(--color-text-primary)] mb-2">5. Acceptable use</h2>
            <p>
              You agree not to use the Service to create or distribute unlawful, infringing, or abusive
              content, to attempt to circumvent plan limits or billing, or to interfere with the Service's
              operation.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[var(--color-text-primary)] mb-2">6. Service "as is"</h2>
            <p>
              The Service is provided "as is" without warranties of any kind. We do not guarantee
              uninterrupted or error-free operation, and we are not liable for indirect or consequential
              damages arising from your use of the Service, to the maximum extent permitted by law.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[var(--color-text-primary)] mb-2">7. Changes</h2>
            <p>
              We may update these Terms from time to time. Continued use of the Service after changes take
              effect constitutes acceptance of the revised Terms.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[var(--color-text-primary)] mb-2">8. Contact</h2>
            <p>
              Questions about these Terms? Email{' '}
              <a href={`mailto:${SUPPORT_EMAIL}`} className="text-[var(--color-primary)] hover:underline">{SUPPORT_EMAIL}</a>.
            </p>
          </section>
        </div>
      </div>
    </SiteLayout>
  );
};

export default Terms;
