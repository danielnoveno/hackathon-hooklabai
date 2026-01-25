'use client';

import { useState } from 'react';

interface TopicSelectorProps {
  walletAddress: string;
  onTopicSelected: (topic: string, hooks: any[]) => void;
}

const QUICK_TOPICS = [
  { label: '🔵 Base Ecosystem', value: 'Base ecosystem' },
  { label: '💰 DeFi Trends', value: 'DeFi trends' },
  { label: '🎨 NFT Drops', value: 'NFT drops' },
  { label: '⚡ Onchain Activity', value: 'Onchain activity' },
];

export default function TopicSelector({
  walletAddress,
  onTopicSelected,
}: TopicSelectorProps) {
  const [customTopic, setCustomTopic] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleTopicSelect = async (topic: string) => {
    if (!topic.trim()) {
      setError('Please enter a topic');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Call API to generate hooks
      const response = await fetch('/api/hooks/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate hooks');
      }

      const data = await response.json();
      
      if (!data.hooks || data.hooks.length === 0) {
        throw new Error('No hooks generated');
      }

      onTopicSelected(topic, data.hooks);
    } catch (err: any) {
      setError(err.message || 'Failed to generate hooks');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-2">Choose Your Topic</h2>
        <p className="text-gray-400">
          Select a quick topic or enter your own
        </p>
      </div>

      {/* Quick Topics */}
      <div className="grid grid-cols-2 gap-4">
        {QUICK_TOPICS.map((topic) => (
          <button
            key={topic.value}
            onClick={() => handleTopicSelect(topic.value)}
            disabled={loading}
            className="card text-left hover:scale-105 transition-transform disabled:opacity-50"
          >
            <div className="text-2xl mb-2">{topic.label.split(' ')[0]}</div>
            <div className="font-semibold">{topic.label.substring(3)}</div>
          </button>
        ))}
      </div>

      {/* Divider */}
      <div className="flex items-center gap-4">
        <div className="flex-1 h-px bg-[#2a2a2a]"></div>
        <span className="text-gray-400 text-sm">OR</span>
        <div className="flex-1 h-px bg-[#2a2a2a]"></div>
      </div>

      {/* Custom Topic */}
      <div className="space-y-4">
        <input
          type="text"
          value={customTopic}
          onChange={(e) => setCustomTopic(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !loading) {
              handleTopicSelect(customTopic);
            }
          }}
          placeholder="Enter custom topic..."
          className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg focus:outline-none focus:border-[#0052ff] transition"
          disabled={loading}
        />
        
        <button
          onClick={() => handleTopicSelect(customTopic)}
          disabled={loading || !customTopic.trim()}
          className="btn-primary w-full"
        >
          {loading ? 'Generating Hooks...' : 'Generate Hooks'}
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="text-center text-gray-400 py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#0052ff] mb-4"></div>
          <p>Analyzing Base channel trends...</p>
          <p className="text-sm mt-2">Generating hooks with AI...</p>
        </div>
      )}
    </div>
  );
}
