import React from 'react';
import SiteLayout from '../components/site/SiteLayout';
import { useSeo } from '../lib/seo';

const SUPPORT_EMAIL = '40rakib70@gmail.com';
const LAST_UPDATED = 'August 12, 2026';

const Privacy: React.FC = () => {
  useSeo({
    title: 'Privacy Policy — Reecap',
    description: 'How Reecap collects, uses and protects your data.',
    path: '/privacy',
    keywords: ['reecap privacy', 'reecap privacy policy'],
  });

  return (
    <SiteLayout>
      <div className="max-w-3xl mx-auto px-5 sm:px-6 py-14 sm:py-20">
        <header className="mb-10">
          <p className="text-[13px] font-semibold uppercase tracking-[0.1em] text-[var(--color-primary)] mb-3">Legal</p>
          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight">Privacy Policy</h1>
          <p className="mt-4 text-[var(--color-text-secondary)]">Last updated: {LAST_UPDATED}</p>
        </header>

        <div className="space-y-8 text-[15px] leading-relaxed text-[var(--color-text-secondary)]">
          <section>
            <h2 className="text-lg font-bold text-[var(--color-text-primary)] mb-2">1. Your photos, videos &amp; designs</h2>
            <p>
              Reecap's editor, Motion Design and Design tools run entirely in your browser. Photos, videos,
              recordings and designs you import are processed on your device and are <strong>not</strong>{' '}
              uploaded to our servers or stored by us.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[var(--color-text-primary)] mb-2">2. Account data</h2>
            <p>
              If you create an account (required for paid plans and render tracking), we collect your email
              address and store it, along with your plan tier and monthly render usage, using Supabase — our
              authentication and database provider. Passwords are hashed and never stored or seen by us in
              plain text.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[var(--color-text-primary)] mb-2">3. Billing data</h2>
            <p>
              Paid subscriptions are processed by Lemon Squeezy, who acts as merchant of record and handles
              all payment card data directly — we never see or store your card details. We receive and store
              a Lemon Squeezy customer ID and subscription ID so we can keep your plan in sync with your
              billing status.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[var(--color-text-primary)] mb-2">4. Local storage</h2>
            <p>
              Reecap uses your browser's local storage and IndexedDB to save in-progress projects, drafts and
              preferences on your device, so you can resume work later. This data stays on your device.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[var(--color-text-primary)] mb-2">5. Third-party processors</h2>
            <p>
              We use the following processors to operate the Service: Supabase (authentication &amp;
              database), Lemon Squeezy (payments), and Vercel (hosting). Each processes data under its own
              privacy policy and security practices.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[var(--color-text-primary)] mb-2">6. Your rights</h2>
            <p>
              You can request access to, correction of, or deletion of your account data at any time by
              emailing us. Deleting your account removes your profile and usage data from our database.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[var(--color-text-primary)] mb-2">7. Contact</h2>
            <p>
              Questions about this policy or your data? Email{' '}
              <a href={`mailto:${SUPPORT_EMAIL}`} className="text-[var(--color-primary)] hover:underline">{SUPPORT_EMAIL}</a>.
            </p>
          </section>
        </div>
      </div>
    </SiteLayout>
  );
};

export default Privacy;
