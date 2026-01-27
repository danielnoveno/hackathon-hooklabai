'use client';

import { useState } from 'react';
import { useAccount, useSendTransaction, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther } from 'viem';

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

  // Ketika transaksi berhasil
  if (isSuccess && !isProcessing) {
    setTimeout(() => {
      onSuccess();
    }, 500);
  }

  const handleTransaction = async () => {
    try {
      setIsProcessing(true);
      
      if (hasCredits) {
        // Minta signature untuk konfirmasi (tetap butuh wallet signature)
        const RECIPIENT_ADDRESS = '0x0000000000000000000000000000000000000000'; // Ganti dengan alamat Anda
        
        // Kirim transaksi dengan value 0 (gratis tapi tetap butuh signature)
        sendTransaction({
          to: RECIPIENT_ADDRESS as `0x${string}`,
          value: parseEther('0'), // 0 ETH karena pakai credits
        });
      } else {
        // Kirim transaksi pembayaran (0.001 ETH)
        const RECIPIENT_ADDRESS = '0x0000000000000000000000000000000000000000'; // Ganti dengan alamat Anda
        
        sendTransaction({
          to: RECIPIENT_ADDRESS as `0x${string}`,
          value: parseEther('0.001'), // 0.001 ETH
        });
      }
      
    } catch (error) {
      console.error('Transaction error:', error);
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="bg-white rounded-2xl p-6 w-[320px] shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-gray-900 font-poppins">
            {hasCredits ? 'Confirm Selection' : 'Payment Required'}
          </h3>
          <button
            onClick={onClose}
            disabled={isPending || isConfirming}
            className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="mb-6">
          {hasCredits ? (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
              <p className="text-sm text-green-700 font-medium">
                ✓ You have credits available
              </p>
              <p className="text-xs text-green-600 mt-1">
                This hook will use 1 of your credits (Free, but requires wallet signature)
              </p>
            </div>
          ) : (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-4">
              <p className="text-sm text-orange-700 font-medium">
                No credits remaining
              </p>
              <p className="text-xs text-orange-600 mt-1">
                Payment required to generate this hook
              </p>
            </div>
          )}

          {/* Amount */}
          {!hasCredits && (
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600 text-sm">Amount:</span>
                <span className="text-gray-900 font-bold">0.001 ETH</span>
              </div>
              <div className="flex items-center justify-between mt-2">
                <span className="text-gray-600 text-sm">To:</span>
                <span className="text-gray-900 text-xs font-mono">
                  0x000...0000
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Transaction Status */}
        {(isPending || isConfirming) && (
          <div className="mb-4 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-2"></div>
            <p className="text-sm text-gray-600">
              {isPending && 'Waiting for approval...'}
              {isConfirming && 'Confirming transaction...'}
            </p>
          </div>
        )}

        {/* Buttons */}
        <div className="space-y-2">
          <button
            onClick={handleTransaction}
            disabled={isPending || isConfirming}
            className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending || isConfirming ? 'Processing...' : hasCredits ? 'Confirm' : 'Pay & Continue'}
          </button>
          <button
            onClick={onClose}
            disabled={isPending || isConfirming}
            className="w-full px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-bold transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
        </div>

        {/* Info */}
        <p className="text-xs text-gray-400 text-center mt-4">
          Transaction will be processed on Base network
        </p>
      </div>
    </div>
  );
}