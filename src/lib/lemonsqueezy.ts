// Lemon Squeezy Overlay Checkout — https://docs.lemonsqueezy.com/help/checkout/overlay-checkout
// Loads the Lemon.js script once and opens a checkout overlay for a given
// variant, passing the signed-in Supabase user id as checkout custom data so
// the webhook (api/webhooks/lemonsqueezy.ts) can map the purchase back to a
// `profiles` row.

declare global {
  interface Window {
    createLemonSqueezy?: () => void;
    LemonSqueezy?: {
      Setup: (opts: { eventHandler: (event: { event: string; data?: unknown }) => void }) => void;
      Url: { Open: (url: string) => void };
      Refresh: () => void;
    };
  }
}

let scriptPromise: Promise<void> | null = null;

function loadLemonScript(): Promise<void> {
  if (window.LemonSqueezy) return Promise.resolve();
  if (scriptPromise) return scriptPromise;

  scriptPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://assets.lemonsqueezy.com/lemon.js';
    script.defer = true;
    // Lemon.js only defines `window.createLemonSqueezy` on load — that must be
    // called to actually initialize `window.LemonSqueezy` itself.
    script.onload = () => {
      window.createLemonSqueezy?.();
      resolve();
    };
    script.onerror = () => reject(new Error('Failed to load Lemon Squeezy checkout script'));
    document.head.appendChild(script);
  });

  return scriptPromise;
}

export interface OpenCheckoutOptions {
  variantId: string;
  userId: string;
  tier: 'creator' | 'pro';
  email?: string;
  onClose?: () => void;
}

export async function openCheckout({ variantId, userId, tier, email, onClose }: OpenCheckoutOptions) {
  const storeSlug = import.meta.env.VITE_LS_STORE_SLUG as string;
  if (!storeSlug || !variantId) {
    console.error('Lemon Squeezy store slug or variant id is not configured');
    return;
  }

  await loadLemonScript();

  if (onClose) {
    window.LemonSqueezy?.Setup({
      eventHandler: (event) => {
        if (event.event === 'Checkout.Success' || event.event === 'Checkout.Closed') onClose();
      },
    });
  }

  const params = new URLSearchParams({
    embed: '1',
    'checkout[custom][supabase_user_id]': userId,
    // The webhook reads this directly rather than mapping Lemon Squeezy's
    // internal numeric variant_id to a tier — simpler and less error-prone
    // than keeping two IDs in sync.
    'checkout[custom][tier]': tier,
  });
  if (email) params.set('checkout[email]', email);

  const url = `https://${storeSlug}.lemonsqueezy.com/checkout/buy/${variantId}?${params.toString()}`;
  window.LemonSqueezy?.Url.Open(url);
}
