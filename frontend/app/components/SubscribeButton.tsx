'use client';

import { useState } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther } from 'viem';
import { HOOKLAB_SUBSCRIPTION_ABI, CONTRACT_ADDRESS } from '@/lib/contract';

interface SubscribeButtonProps {
  onSuccess?: () => void;
}

export default function SubscribeButton({ onSuccess }: SubscribeButtonProps) {
  const { address } = useAccount();
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [error, setError] = useState('');

  const { writeContract, data: hash, isPending } = useWriteContract();
  
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const handleSubscribe = async () => {
    if (!address) return;

    setIsSubscribing(true);
    setError('');

    try {
      writeContract({
        address: CONTRACT_ADDRESS,
        abi: HOOKLAB_SUBSCRIPTION_ABI,
        functionName: 'subscribeMonthly',
        value: parseEther('0.001'),
      });
    } catch (err: any) {
      console.error('Subscription error:', err);
      setError(err.message || 'Failed to subscribe');
      setIsSubscribing(false);
    }
  };

  // Handle successful subscription
  if (isSuccess && isSubscribing) {
    setIsSubscribing(false);
    
    // Verify premium status and update Supabase
    fetch('/api/premium/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ walletAddress: address }),
    }).then(() => {
      if (onSuccess) {
        onSuccess();
      }
    });
  }

  const loading = isPending || isConfirming || isSubscribing;

  return (
    <div>
      <button
        onClick={handleSubscribe}
        disabled={loading}
        className="btn-primary bg-gradient-to-r from-[#0052ff] to-[#00d395] text-sm"
      >
        {loading ? 'Processing...' : '✨ Subscribe (0.001 ETH)'}
      </button>

      {error && (
        <p className="text-red-400 text-xs mt-1">{error}</p>
      )}

      {isSuccess && (
        <p className="text-[#00d395] text-xs mt-1">✓ Subscribed!</p>
      )}
    </div>
  );
}
