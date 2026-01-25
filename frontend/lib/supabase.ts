import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ============ Types ============

export interface User {
  id: string;
  wallet_address: string;
  is_premium: boolean;
  premium_expiry: string | null;
  created_at: string;
}

export interface Quota {
  id: string;
  wallet_address: string;
  remaining_credits: number;
  updated_at: string;
}

export interface UsageLog {
  id: string;
  wallet_address: string;
  topic: string;
  selected_hook: string;
  created_at: string;
}

// ============ User Functions ============

export async function getOrCreateUser(walletAddress: string): Promise<User> {
  // Check if user exists
  const { data: existingUser, error: fetchError } = await supabase
    .from('users')
    .select('*')
    .eq('wallet_address', walletAddress)
    .single();

  if (existingUser) {
    return existingUser;
  }

  // Create new user
  const { data: newUser, error: createError } = await supabase
    .from('users')
    .insert({ wallet_address: walletAddress })
    .select()
    .single();

  if (createError) {
    throw new Error(`Failed to create user: ${createError.message}`);
  }

  return newUser;
}

export async function updatePremiumStatus(
  walletAddress: string,
  isPremium: boolean,
  expiryTimestamp?: number
): Promise<void> {
  const premiumExpiry = expiryTimestamp
    ? new Date(expiryTimestamp * 1000).toISOString()
    : null;

  const { error } = await supabase
    .from('users')
    .update({
      is_premium: isPremium,
      premium_expiry: premiumExpiry,
    })
    .eq('wallet_address', walletAddress);

  if (error) {
    throw new Error(`Failed to update premium status: ${error.message}`);
  }
}

// ============ Quota Functions ============

export async function getOrCreateQuota(walletAddress: string): Promise<Quota> {
  // Check if quota exists
  const { data: existingQuota, error: fetchError } = await supabase
    .from('quotas')
    .select('*')
    .eq('wallet_address', walletAddress)
    .single();

  if (existingQuota) {
    return existingQuota;
  }

  // Create new quota (default: 5 credits)
  const { data: newQuota, error: createError } = await supabase
    .from('quotas')
    .insert({ wallet_address: walletAddress, remaining_credits: 5 })
    .select()
    .single();

  if (createError) {
    throw new Error(`Failed to create quota: ${createError.message}`);
  }

  return newQuota;
}

export async function getUserQuota(walletAddress: string): Promise<number> {
  const quota = await getOrCreateQuota(walletAddress);
  return quota.remaining_credits;
}

export async function deductQuota(walletAddress: string): Promise<number> {
  const quota = await getOrCreateQuota(walletAddress);

  if (quota.remaining_credits <= 0) {
    throw new Error('Insufficient quota');
  }

  const newCredits = quota.remaining_credits - 1;

  const { error } = await supabase
    .from('quotas')
    .update({
      remaining_credits: newCredits,
      updated_at: new Date().toISOString(),
    })
    .eq('wallet_address', walletAddress);

  if (error) {
    throw new Error(`Failed to deduct quota: ${error.message}`);
  }

  return newCredits;
}

// ============ Usage Log Functions ============

export async function logUsage(
  walletAddress: string,
  topic: string,
  selectedHook: string
): Promise<void> {
  const { error } = await supabase.from('usage_logs').insert({
    wallet_address: walletAddress,
    topic,
    selected_hook: selectedHook,
  });

  if (error) {
    throw new Error(`Failed to log usage: ${error.message}`);
  }
}
