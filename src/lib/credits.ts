import { supabase, type Tier } from './supabaseClient';

export const TIER_LIMITS: Record<
  Tier,
  { label: string; maxResolution: '720p' | '1080p' | '4k'; maxDuration: number; watermark: boolean }
> = {
  free: { label: 'Free', maxResolution: '720p', maxDuration: 3, watermark: true },
  creator: { label: 'Creator', maxResolution: '1080p', maxDuration: 10, watermark: false },
  pro: { label: 'Pro', maxResolution: '4k', maxDuration: 30, watermark: false },
};

/** Atomically checks and consumes one render credit for the signed-in user. */
export async function consumeCredit(): Promise<boolean> {
  const { data, error } = await supabase.rpc('consume_credit');
  if (error) {
    console.error('consume_credit failed', error);
    return false;
  }
  return Boolean(data);
}

/** Refunds a credit after a failed export so the user isn't charged for it. */
export async function refundCredit(): Promise<void> {
  const { error } = await supabase.rpc('refund_credit');
  if (error) console.error('refund_credit failed', error);
}
