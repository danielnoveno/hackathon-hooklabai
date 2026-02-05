'use client';

import { useState, useEffect } from 'react';
import { useAccount, useSignMessage, useChainId, useSwitchChain } from 'wagmi';
import toast from 'react-hot-toast';
import TransactionModal from './TransactionModal';

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
  initialHistoryId?: string; // New Prop
};

export default function HookResult({ hook, onTryAnother, onBack, initialHistoryId }: HookResultProps) {
  const [copied, setCopied] = useState(false);
  const [showExitWarning, setShowExitWarning] = useState(false);
  
  // Full content untuk display
  const fullContent = hook.content;
  
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string | null>(null);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);

  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { switchChainAsync } = useSwitchChain();
  const { signMessageAsync } = useSignMessage(); 

  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [activePaymentMode, setActivePaymentMode] = useState<'image' | 'video'>('image');

  // Modal Success Handler
  const handlePaymentSuccess = () => {
    setShowPaymentModal(false);
    if (activePaymentMode === 'video') {
      generateImageAndThenVideo();
    } else {
      generateImageAfterPayment();
    }
  };

  // Generate hashtags (Dynamic based on topic)
  const hashtags = [`#${hook.topic.replace(/\s+/g, '')}`, '#Web3', '#IDRX', '#Farcaster'];

  const generateImageAfterPayment = async (): Promise<string | null> => {
    setIsGeneratingImage(true);
    try {
      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            prompt: fullContent,
            historyId: initialHistoryId // Pass ID for update
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate image');
      }

      if (data.imageUrl) {
        setGeneratedImageUrl(data.imageUrl);
        toast.success("Image generated successfully!");
        return data.imageUrl;
      }
      return null;
    } catch (error: any) {
      console.error("Error generating image:", error);
      toast.error(`Error: ${error.message}`);
      return null;
    } finally {
      setIsGeneratingImage(false);
    }
  }

  const generateVideoFromImage = async (imageUrl: string) => {
    setIsGeneratingVideo(true);
    try {
      const response = await fetch('/api/generate-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: fullContent,
          imageUrl: imageUrl
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate video');
      }

      if (data.videoUrl) {
        setGeneratedVideoUrl(data.videoUrl);
        toast.success("Video generated successfully!");
      }
    } catch (error: any) {
      console.error("Error generating video:", error);
      toast.error(`Error: ${error.message}`);
    } finally {
      setIsGeneratingVideo(false);
    }
  };

  const generateImageAndThenVideo = async () => {
    // 1. Generate Image
    const imageUrl = await generateImageAfterPayment();

    // 2. If successful, Generate Video
    if (imageUrl) {
      await generateVideoFromImage(imageUrl);
    }
  };

  const handleGenerateVideo = async () => {
    if (!generatedImageUrl) return;
    setIsGeneratingVideo(true);
    try {
      const response = await fetch('/api/generate-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: fullContent,
          imageUrl: generatedImageUrl
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate video');
      }

      if (data.videoUrl) {
        setGeneratedVideoUrl(data.videoUrl); // Note: API returns { videoUrl: "data:video/mp4;base64,..." }
        toast.success("Video generated successfully!");
      }
    } catch (error: any) {
      console.error("Error generating video:", error);
      toast.error(`Error: ${error.message}`);
    } finally {
      setIsGeneratingVideo(false);
    }
  };

  const handleGenerateImage = () => {
    if (!isConnected) {
      toast.error("Please connect wallet first");
      return;
    }
    setActivePaymentMode('image');
    setShowPaymentModal(true);
  };

  const handleGenerateVideoTrigger = () => {
    if (!isConnected) {
      toast.error("Please connect wallet first");
      return;
    }
    setActivePaymentMode('video');
    setShowPaymentModal(true);
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

  function handleDownload(url: string, filename: string) {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  return (
    <div className="flex-1 flex flex-col bg-black overflow-y-auto relative">
      {/* Header */}
      <div className="pt-12 px-6 pb-6 flex items-center gap-3">
        <button
          onClick={onBack}
          className="w-8 h-8 flex items-center justify-center text-white/60 hover:text-white transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div className="relative w-12 h-12 flex items-center justify-center">
          <img src="/logo_glassmorp.png" alt="Logo HookLab AI" className="w-full h-full object-contain" />
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
              <div className="mt-4 rounded-xl overflow-hidden border border-white/10 relative group">
                <img src={generatedImageUrl} alt="AI Generated" className="w-full h-auto object-cover" />
                <button
                  onClick={() => handleDownload(generatedImageUrl, `hooklab-image-${Date.now()}.png`)}
                  className="absolute top-2 right-2 bg-black/60 hover:bg-black/80 text-white p-2 rounded-full backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100"
                  title="Download Image"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                </button>
              </div>
            )}

            {/* AI Generated Video Display */}
            {generatedVideoUrl && (
              <div className="mt-4 rounded-xl overflow-hidden border border-white/10 relative group">
                <video src={generatedVideoUrl} controls autoPlay loop className="w-full h-auto object-cover" />
                <button
                  onClick={() => handleDownload(generatedVideoUrl, `hooklab-video-${Date.now()}.mp4`)}
                  className="absolute top-2 right-2 bg-black/60 hover:bg-black/80 text-white p-2 rounded-full backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100"
                  title="Download Video"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                </button>
              </div>
            )}

            {/* Loading Indicator */}
            {isGeneratingImage && (
              <div className="mt-4 p-4 rounded-xl bg-white/5 flex items-center justify-center gap-3">
                <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-sm text-gray-400">Generating visual...</span>
              </div>
            )}

            {/* Video Loading Indicator */}
            {isGeneratingVideo && (
              <div className="mt-4 p-4 rounded-xl bg-white/5 flex items-center justify-center gap-3">
                <div className="w-5 h-5 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-sm text-gray-400">Generating video animation... (This may take ~30s)</span>
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
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-white/5 hover:bg-white/10 backdrop-blur-md border border-white/10 text-white rounded-xl transition-all font-medium active:scale-[0.98]"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                {copied ? 'Copied!' : 'Copy'}
              </button>
              <button
                onClick={handleShare}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl transition-all font-medium shadow-lg hover:shadow-blue-500/30 active:scale-[0.98]"
              >
                
                Post 
              </button>
            </div>

            {/* Row 2: Visualize Options (Show both if nothing generated yet) */}
            {!generatedImageUrl && !generatedVideoUrl && (
              <div className="flex gap-3 w-full">
                <button
                  onClick={handleGenerateImage}
                  disabled={isGeneratingImage || isGeneratingVideo}
                  className="flex-1 flex flex-col items-center justify-center gap-1 px-4 py-3 bg-white/5 hover:bg-white/10 backdrop-blur-md border border-white/10 text-white rounded-2xl transition-all font-medium disabled:opacity-50 active:scale-[0.98] shadow-lg group"
                >
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span>Image</span>
                  </div>
                  <span className="text-[10px] text-white/40 font-mono">10 IDRX</span>
                </button>
                
                <button
                  onClick={handleGenerateVideoTrigger}
                  disabled={isGeneratingImage || isGeneratingVideo}
                  className="flex-1 flex flex-col items-center justify-center gap-1 px-4 py-3 bg-linear-to-br from-indigo-600/20 to-blue-600/20 hover:from-indigo-600/30 hover:to-blue-600/30 backdrop-blur-md border border-indigo-500/30 text-white rounded-2xl transition-all font-medium disabled:opacity-50 active:scale-[0.98] shadow-lg shadow-indigo-500/10 group"
                >
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    <span>Video</span>
                  </div>
                  <span className="text-[10px] text-indigo-400/60 font-mono">50 IDRX</span>
                </button>
              </div>
            )}

            {/* Row 3: Animate Video (Only if Image exists & Video doesn't) */}
            {generatedImageUrl && !generatedVideoUrl && (
              <button
                onClick={handleGenerateVideoTrigger}
                disabled={isGeneratingVideo}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white rounded-xl transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(79,70,229,0.3)] hover:shadow-[0_0_30px_rgba(79,70,229,0.5)] active:scale-[0.98]"
              >
                {isGeneratingVideo ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Animating...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Animate Image (Video - 50 IDRX)
                  </>
                )}
              </button>
            )}

            {/* Payment Modal for Image/Video */}
            <TransactionModal
              isOpen={showPaymentModal}
              onClose={() => setShowPaymentModal(false)}
              onSuccess={handlePaymentSuccess}
              hasCredits={false}
              mode={activePaymentMode}
            />
          </div>
        </div>
      </div>


      {/* Try Another Button */}
      <div className="px-6 pb-12">
        <button
          onClick={onTryAnother}
          className="w-full px-6 py-3 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/10 text-white rounded-2xl font-bold text-lg transition-all active:scale-[0.98] shadow-lg"
        >
          Try Another Hooks
        </button>
      </div>

    </div>
  );
}