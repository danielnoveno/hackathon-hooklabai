'use client';

import { useState, useEffect } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useSignMessage, useSwitchChain, useChainId, useReadContract, useBalance, useSendTransaction } from 'wagmi';
import { parseEther, formatEther } from 'viem';
import { HOOKLAB_SUBSCRIPTION_ABI, IDRX_TOKEN_ABI } from '../config/abi';
import toast from 'react-hot-toast';

type TransactionModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  hasCredits: boolean;
  mode?: 'subscription' | 'image' | 'video';
};

export default function TransactionModal({
  isOpen,
  onClose,
  onSuccess,
  hasCredits,
  mode = 'subscription'
}: TransactionModalProps) {
  const { address } = useAccount();
  const [isProcessing, setIsProcessing] = useState(false);

  const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as `0x${string}`;
  const tokenAddress = process.env.NEXT_PUBLIC_TOKEN_ADDRESS as `0x${string}`;
  const devAddress = process.env.NEXT_PUBLIC_DEVELOPER_ADDRESS as `0x${string}`;

  // Prices
  const prices = {
    subscription: { idrx: '500' },
    image: { 
      idrx: process.env.NEXT_PUBLIC_IMAGE_PRICE_IDRX || '10' 
    },
    video: { 
      idrx: process.env.NEXT_PUBLIC_VIDEO_PRICE_IDRX || '50' 
    }
  };

  const currentPrice = mode === 'image' ? prices.image : mode === 'video' ? prices.video : prices.subscription;

  const chainId = useChainId();
  const { switchChainAsync } = useSwitchChain();
  const { signMessageAsync } = useSignMessage();

  // CONTRACT WRITES
  const { data: hash, writeContract, reset, isPending, error: writeError } = useWriteContract();

  // READS
  const { data: idrxBalance } = useReadContract({
    address: tokenAddress,
    abi: IDRX_TOKEN_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
  });
  
  const { data: allowance } = useReadContract({
    address: tokenAddress,
    abi: IDRX_TOKEN_ABI,
    functionName: 'allowance',
    args: address ? [address, contractAddress] : undefined,
  });

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  // Reset states when modal closes
  useEffect(() => {
    if (!isOpen) {
      setIsProcessing(false);
      reset();
    }
  }, [isOpen, reset]);

  // Handle success
  useEffect(() => {
    if (isSuccess && isProcessing) {
      setIsProcessing(false);
      onSuccess();
    }
  }, [isSuccess, isProcessing, onSuccess]);

  useEffect(() => {
    if (writeError) {
      setIsProcessing(false);
      console.error("Contract Write Error:", writeError);

      const isUserReject = writeError.message?.toLowerCase().includes('user rejected') || 
                          writeError.message?.toLowerCase().includes('user denied');
      
      if (isUserReject) {
        toast.error("Transaction cancelled", { id: 'tx-status' });
      } else {
        toast.error(writeError.message || "Execution failed", { id: 'tx-status' });
      }
      // Removed immediate toast.dismiss('tx-status') to allow user to read the message
    }
  }, [writeError]);

  const handleTransaction = async () => {
    if (isProcessing || isPending || isConfirming) return;

    try {
      setIsProcessing(true);

      // Network Check
      const configuredChainId = Number(process.env.NEXT_PUBLIC_CHAIN_ID || "84532");
      if (chainId !== configuredChainId) {
        await switchChainAsync({ chainId: configuredChainId });
      }

      if (hasCredits) {
        await signMessageAsync({
          message: `Confirm hook selection on HookLab AI\nUser: ${address}\nAction: Use 1 Credit`,
        });
        setIsProcessing(false);
        onSuccess();
      } else {
        const priceIdrx = parseEther(currentPrice.idrx);

        // IDRX TOKEN FLOW
        if (!idrxBalance || idrxBalance < priceIdrx) {
          toast.error(`Insufficient $IDRX balance (Need ${currentPrice.idrx})`);
          setIsProcessing(false);
          return;
        }

        if (mode === 'subscription') {
          // Check Allowance for contract
          if (!allowance || allowance < priceIdrx) {
            toast.loading("Approving $IDRX...", { id: 'tx-status' });
            writeContract({
              address: tokenAddress,
              abi: IDRX_TOKEN_ABI,
              functionName: 'approve',
              args: [contractAddress, priceIdrx * BigInt(10)], 
            });
            return;
          }

          toast.loading("Subscribing with $IDRX...", { id: 'tx-status' });
          writeContract({
            address: contractAddress,
            abi: HOOKLAB_SUBSCRIPTION_ABI,
            functionName: 'subscribeWithToken',
          });
        } else {
          // Direct transfer for Image/Video
          toast.loading(`Paying for ${mode}...`, { id: 'tx-status' });
          writeContract({
            address: tokenAddress,
            abi: IDRX_TOKEN_ABI,
            functionName: 'transfer',
            args: [devAddress, priceIdrx],
          });
        }
      }
    } catch (err) {
      console.error(err);
      setIsProcessing(false);
      toast.dismiss('tx-status');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-sm bg-[#121212] border border-white/10 rounded-[28px] overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300">
        <div className="p-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="text-xl font-bold text-white mb-1">
                {mode === 'image' ? 'Generate Image' : mode === 'video' ? 'Generate Video' : 'Confirm Access'}
              </h3>
              <p className="text-white/40 text-sm">
                IDRX Payment Required
              </p>
            </div>
            {!isProcessing && !isConfirming && (
              <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors">
                <svg className="w-5 h-5 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          <div className="bg-white/5 rounded-2xl p-4 mb-6 border border-white/5">
            <div className="flex items-center justify-between mb-3 text-sm">
              <span className="text-white/40 font-medium">Amount</span>
              <span className="text-white font-bold text-lg tracking-wide text-right">
                {hasCredits ? '1 Credit' : `${currentPrice.idrx} IDRX`}
              </span>
            </div>
            
            <div className="h-[px] bg-white/5 my-3 w-full" />
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-white/40 text-xs">Network</span>
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                  <span className="text-white/80 text-xs font-medium">Base Sepolia</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/40 text-xs">Your Balance</span>
                <div className="flex flex-col items-end gap-1 text-right">
                  <span className="text-white/80 text-xs font-mono font-bold">
                    {idrxBalance !== undefined ? `${Number(formatEther(idrxBalance)).toFixed(0)} $IDRX` : 'Loading...'}
                  </span>
                  {!hasCredits && (
                    <div className="flex flex-col items-end gap-0.5">
                      <p className="text-[9px] text-white/20 italic max-w-[150px]">
                        $IDRX Loyalty Rewards
                      </p>
                      <p className="text-[8px] text-white/10">Progress persists on-chain</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={handleTransaction}
            disabled={isProcessing || isPending || isConfirming}
            className="w-full py-4 rounded-2xl font-bold text-white transition-all transform active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-xl bg-gradient-to-r from-indigo-600 to-indigo-500 shadow-indigo-900/20"
          >
            {isProcessing || isPending || isConfirming ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>{isConfirming ? 'Confirming...' : 'Processing...'}</span>
              </div>
            ) : hasCredits ? (
              'Confirm Selection'
            ) : (
              (idrxBalance === undefined || idrxBalance < parseEther(currentPrice.idrx)) ? 'Insufficient $IDRX' : (!allowance || allowance < parseEther('500')) ? 'Approve $IDRX' : 'Pay & Continue'
            )}
          </button>
          
          <p className="mt-4 text-[10px] text-white/20 text-center leading-relaxed">
            By confirming, you agree to access this content.<br />
            Subscribing grants 1 month of premium access.
          </p>
        </div>
      </div>
    </div>
  );
}