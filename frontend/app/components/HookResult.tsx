'use client';

import { useState } from 'react';

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
};

export default function HookResult({ hook, onTryAnother }: HookResultProps) {
  const [copied, setCopied] = useState(false);

  // Generate hashtags (contoh)
  const hashtags = ['#Link', '#smile', '#post', '#smile', '#post', '#post', '#happy', '#clear', '#tweet', '#clear', '#tweet'];

  // Full content untuk display (gabungan berulang seperti di desain)
  const fullContent = `${hook.content}

${hook.content}${hook.content}${hook.content}${hook.content}${hook.content}${hook.content}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(fullContent + '\n\n' + hashtags.join(' '));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'My Hook from HookLab AI',
          text: fullContent + '\n\n' + hashtags.join(' '),
        });
      } catch (error) {
        console.log('Share cancelled or failed:', error);
      }
    } else {
      // Fallback: copy to clipboard
      handleCopy();
    }
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
    <div className="flex-1 flex flex-col bg-black overflow-y-auto">
      {/* Header */}
      <div className="pt-12 px-6 pb-6 flex items-center gap-3">
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
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-[#2A2A2A] hover:bg-[#333333] text-white rounded-xl transition-colors font-medium"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
              Share
            </button>
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
    </div>
  );
}