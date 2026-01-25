'use client';

import { useState } from 'react';

interface ContentRevealProps {
  hook: string;
  fullContent: string;
  onReset: () => void;
}

export default function ContentReveal({
  hook,
  fullContent,
  onReset,
}: ContentRevealProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(fullContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePostToWarpcast = () => {
    const encodedText = encodeURIComponent(fullContent);
    const warpcastUrl = `warpcast://compose?text=${encodedText}`;
    
    // Try to open Warpcast app
    window.location.href = warpcastUrl;
    
    // Fallback to web version after a delay
    setTimeout(() => {
      window.open(`https://warpcast.com/~/compose?text=${encodedText}`, '_blank');
    }, 1000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="inline-block px-4 py-2 bg-[#00d395]/10 border border-[#00d395]/20 rounded-full text-[#00d395] text-sm font-semibold mb-4">
          ✨ Content Revealed
        </div>
        <h2 className="text-3xl font-bold">Your Generated Post</h2>
      </div>

      {/* Selected Hook */}
      <div className="card">
        <p className="text-sm text-gray-400 mb-2">Selected Hook:</p>
        <p className="text-lg font-semibold text-[#00d395]">{hook}</p>
      </div>

      {/* Full Content */}
      <div className="card bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] border-2 border-[#0052ff]/30">
        <p className="text-sm text-gray-400 mb-3">Full Content:</p>
        <div className="bg-[#0a0a0a] p-4 rounded-lg border border-[#2a2a2a]">
          <p className="text-lg leading-relaxed whitespace-pre-wrap">
            {fullContent}
          </p>
        </div>
        
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-[#2a2a2a]">
          <p className="text-sm text-gray-400">
            {fullContent.length} characters
          </p>
          <button
            onClick={handleCopy}
            className="text-sm text-[#0052ff] hover:text-[#00d395] transition"
          >
            {copied ? '✓ Copied!' : '📋 Copy'}
          </button>
        </div>
      </div>

      {/* Actions */}
      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={handlePostToWarpcast}
          className="btn-primary bg-gradient-to-r from-[#0052ff] to-[#00d395] text-lg py-4"
        >
          🚀 Post to Warpcast
        </button>
        
        <button
          onClick={onReset}
          className="btn-primary bg-[#2a2a2a] hover:bg-[#3a3a3a] text-lg py-4"
        >
          ↻ Generate Another
        </button>
      </div>

      {/* Info */}
      <div className="text-center text-sm text-gray-400">
        <p>
          Clicking "Post to Warpcast" will open the Warpcast app or web composer
          with your content pre-filled.
        </p>
      </div>
    </div>
  );
}
