'use client';

import { useState } from 'react';

interface HookSelectorProps {
  walletAddress: string;
  topic: string;
  hooks: any[];
  isPremium: boolean;
  currentQuota: number;
  onHookSelected: (hook: string, fullContent: string) => void;
  onBack: () => void;
}

export default function HookSelector({
  walletAddress,
  topic,
  hooks,
  isPremium,
  currentQuota,
  onHookSelected,
  onBack,
}: HookSelectorProps) {
  const [selectedHookId, setSelectedHookId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleHookClick = async (hook: any) => {
    // Check quota before proceeding
    if (!isPremium && currentQuota <= 0) {
      setError('Insufficient quota. Subscribe to continue.');
      return;
    }

    setSelectedHookId(hook.id);
    setLoading(true);
    setError('');

    try {
      // Step 1: Deduct quota
      const quotaResponse = await fetch('/api/quota', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          walletAddress,
          selectedHook: hook.hook,
          topic,
        }),
      });

      if (!quotaResponse.ok) {
        const quotaData = await quotaResponse.json();
        throw new Error(quotaData.error || 'Quota check failed');
      }

      // Step 2: Generate full content
      const contentResponse = await fetch('/api/content/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          selectedHook: hook.hook,
          topic,
        }),
      });

      if (!contentResponse.ok) {
        throw new Error('Failed to generate content');
      }

      const contentData = await contentResponse.json();
      
      onHookSelected(hook.hook, contentData.fullContent);
    } catch (err: any) {
      setError(err.message || 'Failed to select hook');
      setSelectedHookId(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <button
            onClick={onBack}
            className="text-gray-400 hover:text-white transition mb-2"
          >
            ← Back
          </button>
          <h2 className="text-3xl font-bold">Select a Hook</h2>
          <p className="text-gray-400 mt-1">
            Topic: <span className="text-white font-semibold">{topic}</span>
          </p>
        </div>
      </div>

      {/* Warning */}
      <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
        <p className="text-yellow-400 text-sm">
          ⚠️ <strong>Blind Selection:</strong> Full content will be revealed only after you select a hook.
          {!isPremium && ` This will consume 1 credit (${currentQuota} remaining).`}
        </p>
      </div>

      {/* Hooks Grid */}
      <div className="grid gap-4">
        {hooks.map((hook) => (
          <button
            key={hook.id}
            onClick={() => handleHookClick(hook)}
            disabled={loading || (!isPremium && currentQuota <= 0)}
            className={`hook-card text-left ${
              selectedHookId === hook.id ? 'selected' : ''
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            <div className="flex items-start justify-between gap-4">
              <p className="text-lg font-medium flex-1">{hook.hook}</p>
              {selectedHookId === hook.id && loading && (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#00d395]"></div>
              )}
            </div>
          </button>
        ))}
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
          {error}
          {error.includes('quota') && (
            <div className="mt-2">
              <a href="#subscribe" className="text-[#00d395] hover:underline">
                Subscribe for unlimited access →
              </a>
            </div>
          )}
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="text-center text-gray-400 py-4">
          <p>Generating full content...</p>
        </div>
      )}

      {/* No Quota Warning */}
      {!isPremium && currentQuota <= 0 && (
        <div className="p-6 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg text-center">
          <p className="text-xl font-semibold mb-2">Out of Credits</p>
          <p className="text-gray-400 mb-4">
            Subscribe to get unlimited hook generation
          </p>
        </div>
      )}
    </div>
  );
}
