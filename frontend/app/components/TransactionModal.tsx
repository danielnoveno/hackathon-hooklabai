'use client';

import { useState } from 'react';
import { useAccount, useSendTransaction, useWaitForTransactionReceipt } from 'wagmi';
import { useSignMessage } from 'wagmi';

type TransactionModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  hasCredits: boolean;
};

export default function TransactionModal({
  isOpen,
  onClose,
  onSuccess,
  hasCredits
}: TransactionModalProps) {
  const { address } = useAccount();
  const [isProcessing, setIsProcessing] = useState(false);

  const { data: hash, sendTransaction, isPending } = useSendTransaction();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const { signMessageAsync } = useSignMessage();


  // Ketika transaksi berhasil
  if (isSuccess && !isProcessing) {
    setTimeout(() => {
      onSuccess();
    }, 500);
  }

  const handleTransaction = async () => {
    try {
      setIsProcessing(true);

      await signMessageAsync({
        message: `Confirm hook generation on HookLab AI\nUser: ${address}`,
      });

      onSuccess();
    } catch (err) {
      console.error('Signature rejected', err);
      setIsProcessing(false);
    }
  };


  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Dark Overlay with Blur */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      />
      
      {/* Modal Container - Glassmorphism */}
      <div className="relative w-full max-w-[340px] bg-black/40 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 shadow-[0_0_40px_rgba(0,0,0,0.5)] animate-pop-in-up">
        
        {/* Decorative Top Light */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-1 bg-gradient-to-r from-transparent via-white/20 to-transparent blur-sm" />

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-white font-poppins tracking-tight">
            {hasCredits ? 'Confirm Selection' : 'Payment Required'}
          </h3>
          <button
            onClick={onClose}
            disabled={isPending || isConfirming}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-all disabled:opacity-50"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="mb-6 space-y-4">
          {hasCredits ? (
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4 relative overflow-hidden group">
               {/* Shine effect */}
               <div className="absolute inset-0 bg-gradient-to-tr from-white/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              <div className="flex items-start gap-3">
                <div className="mt-0.5 p-1 bg-emerald-500/20 rounded-full">
                  <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-emerald-400 font-bold mb-1">
                    Credits Available
                  </p>
                  <p className="text-xs text-emerald-400/80 leading-relaxed">
                    This hook uses 1 credit. Free signature required.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-orange-500/10 border border-orange-500/20 rounded-2xl p-4">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 p-1 bg-orange-500/20 rounded-full">
                   <svg className="w-4 h-4 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-orange-400 font-bold mb-1">
                    No Credits Remaining
                  </p>
                  <p className="text-xs text-orange-400/80 leading-relaxed">
                    Payment required to proceed.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Amount (Only if no credits) */}
          {!hasCredits && (
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-white/60 text-sm font-medium">Amount</span>
                <span className="text-white font-bold text-lg tracking-wide">0.001 ETH</span>
              </div>
              <div className="h-px bg-white/5 w-full" />
              <div className="flex items-center justify-between">
                <span className="text-white/40 text-xs">Destination</span>
                <span className="text-white/80 text-xs font-mono bg-white/5 px-2 py-1 rounded">
                  0x000...0000
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Transaction Status Loader */}
        {(isPending || isConfirming || isProcessing) && (
          <div className="mb-6 flex flex-col items-center animate-fade-in">
            <div className="relative w-12 h-12 mb-3">
               <div className="absolute inset-0 rounded-full border-4 border-blue-500/30 border-t-blue-500 animate-spin" />
            </div>
            <p className="text-sm text-white/80 font-medium">
              {(isPending || isProcessing) && 'Waiting for approval...'}
              {isConfirming && 'Confirming transaction...'}
            </p>
          </div>
        )}

        {/* Buttons */}
        <div className="space-y-3">
          <button
            onClick={handleTransaction}
            disabled={isPending || isConfirming || isProcessing}
            className="group relative w-full h-12 flex items-center justify-center overflow-hidden rounded-xl bg-white/10 backdrop-blur-md border border-white/20 text-white font-bold transition-all hover:bg-white/20 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(59,130,246,0.2)] hover:shadow-[0_0_30px_rgba(59,130,246,0.4)]"
          >
            {/* Gradient Background - Subtle */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/40 to-indigo-600/40 opacity-80 group-hover:opacity-100 transition-opacity" />
            
            {/* Shimmer overlay */}
            <div className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-1000" />
            
            <span className="relative flex items-center gap-2 drop-shadow-sm">
              {isPending || isConfirming || isProcessing ? 'Processing...' : hasCredits ? 'Confirm Selection' : 'Pay & Continue'}
              {!isPending && !isConfirming && !isProcessing && (
                 <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
              )}
            </span>
          </button>
          
          <button
            onClick={onClose}
            disabled={isPending || isConfirming || isProcessing}
            className="w-full h-12 flex items-center justify-center rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/20 text-white/50 hover:text-white backdrop-blur-sm font-semibold transition-all duration-300 disabled:opacity-50 text-sm"
          >
            Cancel
          </button>
        </div>

        {/* Footer Info */}
        <p className="text-[10px] text-white/30 text-center mt-6 font-medium">
          Secured by Base Network
        </p>
      </div>
    </div>
  );
}