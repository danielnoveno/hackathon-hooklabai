'use client';

import { useState, useEffect } from 'react';
import { useSendTransaction, useWaitForTransactionReceipt, useAccount, useSwitchChain, useChainId } from 'wagmi';
import { foundry } from 'wagmi/chains';
import { parseEther } from 'viem';
import toast from 'react-hot-toast';

type Hook = {
  id: string;
  username: string;
  topic: string;
  content: string;
  preview: string;
};

type HookResultProps = {
  hook: Hook;
  onTryAnother: () => void;
  onBack: () => void;
};

export default function HookResult({ hook, onTryAnother, onBack }: HookResultProps) {
  const [copied, setCopied] = useState(false);
  const [showExitWarning, setShowExitWarning] = useState(false);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [isPaying, setIsPaying] = useState(false);
  const [paymentHash, setPaymentHash] = useState<`0x${string}` | undefined>(undefined);

  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { switchChainAsync } = useSwitchChain();
  const { data: hash, sendTransaction, isPending: isConfirmingWallet, error: sendError } = useSendTransaction();

  const { isLoading: isWaitingReceipt, isSuccess: isPaymentSuccess } = useWaitForTransactionReceipt({
    hash: paymentHash,
  });

  // ... (lines 37-67 are unchanged, assuming user context isn't needed here) 

  // Watch for transaction hash updates
  useEffect(() => {
    if (hash) {
      setPaymentHash(hash);
      setIsPaying(true);
      toast.loading("Processing payment...", { id: "payment" });
    }
  }, [hash]);

  // Watch for errors
  useEffect(() => {
    if (sendError) {
      toast.error("Payment rejected or failed");
      setIsPaying(false);
    }
  }, [sendError]);

  // Watch for payment success -> Trigger Generation
  useEffect(() => {
    if (isPaymentSuccess) {
      toast.success("Payment confirmed! Generating image...", { id: "payment" });
      generateImageAfterPayment();
      setIsPaying(false);
    }
  }, [isPaymentSuccess]);

  // Generate hashtags (Dynamic based on topic)
  const hashtags = [`#${hook.topic.replace(/\s+/g, '')}`, '#Web3', '#HookLab', '#Farcaster'];

  // Full content untuk display
  const fullContent = hook.content;

  const generateImageAfterPayment = async () => {
    setIsGeneratingImage(true);
    try {
      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: fullContent }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate image');
      }

      if (data.imageUrl) {
        setGeneratedImageUrl(data.imageUrl);
        toast.success("Image generated successfully!");
      }
    } catch (error: any) {
      console.error("Error generating image:", error);
      toast.error(`Error: ${error.message}`);
    } finally {
      setIsGeneratingImage(false);
    }
  }

  const handleGenerateImage = async () => {
    // Developer Mode: Bypass Payment & Wallet Connection
    if (process.env.NEXT_PUBLIC_MOCK_PAYMENT === 'true') {
      toast.success("Developer Mode: Payment Bypassed");
      generateImageAfterPayment();
      return;
    }

    if (!isConnected || !address) {
      toast.error("Please connect your wallet first!");
      return;
    }

    // Auto-switch to Configured Network if wrong
    const configuredChainId = Number(process.env.NEXT_PUBLIC_CHAIN_ID || "31337");

    if (chainId !== configuredChainId) {
      try {
        toast.loading(`Switching to network ID ${configuredChainId}...`, { duration: 2000 });
        await switchChainAsync({ chainId: configuredChainId });
      } catch (error) {
        toast.error(`Failed to switch network. Please switch to chain ID ${configuredChainId} manually.`);
        return;
      }
    }

    if (generatedImageUrl) return;

    const price = process.env.NEXT_PUBLIC_IMAGE_GENERATION_PRICE || "0.0001";
    const receiver = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as `0x${string}`;

    if (!receiver) {
      toast.error("Contract address config missing");
      return;
    }

    try {
      sendTransaction({
        to: receiver,
        value: parseEther(price),
      });
    } catch (e) {
      console.error("Transaction failed to start", e);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(fullContent + '\n\n' + hashtags.join(' '));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    // 1. Copy to clipboard automatically
    handleCopy();

    // 2. Open Warpcast Compose (Direct form posting)
    const text = fullContent + '\n\n' + hashtags.join(' ');
    const encodedText = encodeURIComponent(text);
    const warpcastUrl = `https://warpcast.com/~/compose?text=${encodedText}`;

    // Open in new tab/window
    window.open(warpcastUrl, '_blank');
  };

  function getInitial(name: string) {
    if (!name) return 'A';
    return name.trim().charAt(0).toUpperCase();
  }

  function getAvatarColor(name: string) {
    const colors = [
      'from-blue-500 to-indigo-600',
      'from-emerald-500 to-teal-600',
      'from-pink-500 to-rose-600',
      'from-purple-500 to-violet-600',
      'from-orange-500 to-amber-600',
    ];
    const index = name ? name.length % colors.length : 0;
    return colors[index];
  }

  return (
    <div className="flex-1 flex flex-col bg-black overflow-y-auto relative">
      {/* Header */}
      <div className="pt-12 px-6 pb-6 flex items-center gap-3">
        <button
          onClick={() => setShowExitWarning(true)}
          className="w-8 h-8 flex items-center justify-center text-white/60 hover:text-white transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div className="relative w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
          <img src="/logo_hooklab.jpg" alt="Logo HookLab AI" />
        </div>
        <span className="text-white font-bold text-xl font-poppins tracking-wide">
          HookLab AI
        </span>
      </div>

      {/* Content Card */}
      <div className="flex-1 px-6 pb-6">
        <div className="bg-[#1A1A1A] rounded-2xl p-5 border border-white/10 h-full flex flex-col">
          {/* Header Card */}
          <div className="flex items-center justify-between mb-4 pb-4 border-b border-white/10">
            <div className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-full bg-gradient-to-br ${getAvatarColor(
                  hook.username
                )} flex items-center justify-center text-white text-sm font-bold`}
              >
                {getInitial(hook.username)}
              </div>

              <span className="text-white font-medium">{hook.username}</span>
            </div>
            <span className="px-3 py-1 bg-blue-600 text-white text-xs rounded-full font-medium">
              {hook.topic}
            </span>
          </div>

          {/* Content Text */}
          <div className="flex-1 overflow-y-auto mb-4">
            <p className="text-white text-sm leading-relaxed whitespace-pre-line">
              {fullContent}
            </p>

            {/* AI Generated Image Display */}
            {generatedImageUrl && (
              <div className="mt-4 rounded-xl overflow-hidden border border-white/10">
                <img src={generatedImageUrl} alt="AI Generated" className="w-full h-auto object-cover" />
              </div>
            )}

            {/* Loading Indicator */}
            {isGeneratingImage && (
              <div className="mt-4 p-4 rounded-xl bg-white/5 flex items-center justify-center gap-3">
                <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-sm text-gray-400">Generating visual...</span>
              </div>
            )}
          </div>

          {/* Hashtags */}
          <div className="flex flex-wrap gap-2 mb-4 pb-4 border-b border-white/10">
            {hashtags.map((tag, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-blue-600/20 text-blue-400 text-xs rounded-full font-medium border border-blue-500/30"
              >
                {tag}
              </span>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-3">
            {/* Row 1: Copy & Share */}
            <div className="flex gap-3">
              <button
                onClick={handleCopy}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-[#2A2A2A] hover:bg-[#333333] text-white rounded-xl transition-colors font-medium"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                {copied ? 'Copied!' : 'Copy'}
              </button>
              <button
                onClick={handleShare}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-[#7C65C1] hover:bg-[#6952A3] text-white rounded-xl transition-colors font-medium"
              >
                <img src="https://warpcast.com/favicon.ico" alt="Warpcast" className="w-5 h-5 rounded-full bg-white" />
                Post on Warpcast
              </button>
            </div>

            {/* Row 2: Generate Image */}
            {!generatedImageUrl && (
              <button
                onClick={handleGenerateImage}
                disabled={isGeneratingImage || isConfirmingWallet || isPaying || isWaitingReceipt}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white rounded-xl transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isGeneratingImage ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Generating...
                  </>
                ) : isConfirmingWallet ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Confirm in Wallet...
                  </>
                ) : isPaying || isWaitingReceipt ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Processing Payment...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Generate Visual ({process.env.NEXT_PUBLIC_MOCK_PAYMENT === 'true' ? 'Free / Dev' : '0.0001 ETH'})
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>


      {/* Try Another Button */}
      <div className="px-6 pb-12">
        <button
          onClick={onTryAnother}
          className="w-full px-6 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold text-lg transition-colors"
        >
          Try Another Hooks
        </button>

      </div>

      {/* Warning Dialog Modal */}
      {showExitWarning && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#1A1A1A] w-full max-w-sm rounded-2xl border border-white/10 p-6 shadow-2xl flex flex-col gap-4">
            <div className="text-center">
              <h3 className="text-xl font-bold text-white mb-2">Wait a second! ⚠️</h3>
              <p className="text-gray-300 text-sm">
                If you go back now, you will lose this hook and have to use another credit to get it back.
                <br /><br />
                Make sure you <b>Copy</b> or <b>Post</b> it before leaving!
              </p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleCopy}
                className="flex-1 py-3 bg-[#2A2A2A] hover:bg-[#333333] text-white rounded-xl transition-colors font-medium text-sm"
              >
                {copied ? 'Copied!' : 'Copy Text'}
              </button>
              <button
                onClick={handleShare}
                className="flex-1 py-3 bg-[#7C65C1] hover:bg-[#6952A3] text-white rounded-xl transition-colors font-medium text-sm"
              >
                Post Now
              </button>
            </div>

            <div className="h-px bg-white/10 w-full my-1"></div>

            <div className="flex flex-col gap-2">
              <button
                onClick={onBack}
                className="w-full py-3 bg-red-500/20 hover:bg-red-500/30 text-red-500 border border-red-500/50 rounded-xl transition-colors font-bold text-sm"
              >
                Yes, Go Back Anyway
              </button>
              <button
                onClick={() => setShowExitWarning(false)}
                className="w-full py-3 text-gray-400 hover:text-white transition-colors font-medium text-sm"
              >
                Cancel, Stay Here
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}