// Smart contract interaction helpers

import { createPublicClient, createWalletClient, http, parseEther } from 'viem';
import { base } from 'viem/chains';

// ============ Contract ABI ============

export const HOOKLAB_SUBSCRIPTION_ABI = [
  {
    type: 'function',
    name: 'subscribeMonthly',
    inputs: [],
    outputs: [],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    name: 'isPremium',
    inputs: [{ name: 'user', type: 'address' }],
    outputs: [{ type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'getExpiry',
    inputs: [{ name: 'user', type: 'address' }],
    outputs: [{ type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'MONTHLY_PRICE',
    inputs: [],
    outputs: [{ type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'event',
    name: 'Subscribed',
    inputs: [
      { name: 'user', type: 'address', indexed: true },
      { name: 'expiry', type: 'uint256', indexed: false },
      { name: 'amount', type: 'uint256', indexed: false },
    ],
  },
] as const;

// ============ Contract Address ============

export const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as `0x${string}`;

// ============ Public Client (Read-only) ============

export const publicClient = createPublicClient({
  chain: base,
  transport: http(),
});

// ============ Read Functions ============

/**
 * Check if a user has active premium subscription
 */
export async function checkPremiumStatus(address: `0x${string}`): Promise<boolean> {
  try {
    const isPremium = await publicClient.readContract({
      address: CONTRACT_ADDRESS,
      abi: HOOKLAB_SUBSCRIPTION_ABI,
      functionName: 'isPremium',
      args: [address],
    });

    return isPremium;
  } catch (error) {
    console.error('Error checking premium status:', error);
    return false;
  }
}

/**
 * Get premium expiry timestamp for a user
 */
export async function getPremiumExpiry(address: `0x${string}`): Promise<number> {
  try {
    const expiry = await publicClient.readContract({
      address: CONTRACT_ADDRESS,
      abi: HOOKLAB_SUBSCRIPTION_ABI,
      functionName: 'getExpiry',
      args: [address],
    });

    return Number(expiry);
  } catch (error) {
    console.error('Error getting premium expiry:', error);
    return 0;
  }
}

/**
 * Get monthly subscription price
 */
export async function getMonthlyPrice(): Promise<bigint> {
  try {
    const price = await publicClient.readContract({
      address: CONTRACT_ADDRESS,
      abi: HOOKLAB_SUBSCRIPTION_ABI,
      functionName: 'MONTHLY_PRICE',
    });

    return price;
  } catch (error) {
    console.error('Error getting monthly price:', error);
    return parseEther('0.001'); // Default fallback
  }
}

// ============ Helper Functions ============

/**
 * Format expiry timestamp to human-readable date
 */
export function formatExpiryDate(timestamp: number): string {
  if (timestamp === 0) {
    return 'Never subscribed';
  }

  const date = new Date(timestamp * 1000);
  const now = new Date();

  if (date < now) {
    return 'Expired';
  }

  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Check if premium is active and not expired
 */
export function isPremiumActive(expiryTimestamp: number): boolean {
  if (expiryTimestamp === 0) {
    return false;
  }

  const now = Math.floor(Date.now() / 1000);
  return expiryTimestamp > now;
}
