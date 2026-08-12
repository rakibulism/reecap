import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    'Supabase env vars are missing (VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY). Auth and billing features will not work.'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Tier = 'free' | 'creator' | 'pro';

export interface Profile {
  id: string;
  tier: Tier;
  monthly_credits: number;
  credits_used_this_month: number;
  billing_period_start: string;
  lemonsqueezy_customer_id: string | null;
  lemonsqueezy_subscription_id: string | null;
  lemonsqueezy_customer_portal_url: string | null;
  created_at: string;
  updated_at: string;
}

export async function fetchProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    console.error('Failed to fetch profile', error);
    return null;
  }

  return data as Profile;
}
