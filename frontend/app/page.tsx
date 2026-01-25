'use client';

import { useState } from 'react';
import { useAccount } from 'wagmi';
import WalletConnect from './components/WalletConnect';
import TopicSelector from './components/TopicSelector';
import HookSelector from './components/HookSelector';
import ContentReveal from './components/ContentReveal';
import SubscribeButton from './components/SubscribeButton';

type AppState = 'connect' | 'topic' | 'hooks' | 'content';

export default function Home() {
  const { address, isConnected } = useAccount();
  const [appState, setAppState] = useState<AppState>('connect');
  const [topic, setTopic] = useState('');
  const [hooks, setHooks] = useState<any[]>([]);
  const [selectedHook, setSelectedHook] = useState('');
  const [fullContent, setFullContent] = useState('');
  const [quota, setQuota] = useState<number | null>(null);
  const [isPremium, setIsPremium] = useState(false);

  // Handle wallet connection
  const handleConnected = () => {
    setAppState('topic');
    fetchQuota();
  };

  // Fetch user quota
  const fetchQuota = async () => {
    if (!address) return;

    try {
      const response = await fetch(`/api/quota?walletAddress=${address}`);
      const data = await response.json();
      setQuota(data.remainingCredits);
      setIsPremium(data.isPremium);
    } catch (error) {
      console.error('Error fetching quota:', error);
    }
  };

  // Handle topic selection
  const handleTopicSelected = (selectedTopic: string, generatedHooks: any[]) => {
    setTopic(selectedTopic);
    setHooks(generatedHooks);
    setAppState('hooks');
  };

  // Handle hook selection
  const handleHookSelected = (hook: string, content: string) => {
    setSelectedHook(hook);
    setFullContent(content);
    setAppState('content');
    fetchQuota(); // Refresh quota after selection
  };

  // Handle reset
  const handleReset = () => {
    setTopic('');
    setHooks([]);
    setSelectedHook('');
    setFullContent('');
    setAppState('topic');
    fetchQuota();
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#0a0a0a] to-[#1a1a1a] text-white">
      {/* Header */}
      <header className="border-b border-[#2a2a2a] bg-[#0a0a0a]/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold gradient-text">HookLab AI</h1>
            <p className="text-sm text-gray-400">Powered by Base & Farcaster</p>
          </div>
          
          <div className="flex items-center gap-4">
            {isConnected && (
              <div className="text-right">
                <p className="text-sm text-gray-400">
                  {isPremium ? (
                    <span className="text-[#00d395] font-semibold">Premium ✨</span>
                  ) : (
                    <span>
                      Credits: <span className="font-semibold">{quota ?? '...'}</span>
                    </span>
                  )}
                </p>
              </div>
            )}
            
            {isConnected && !isPremium && <SubscribeButton onSuccess={fetchQuota} />}
            
            <WalletConnect onConnected={handleConnected} />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Hero Section */}
        {appState === 'connect' && (
          <div className="text-center space-y-6 py-20">
            <h2 className="text-5xl font-bold leading-tight">
              Generate Viral{' '}
              <span className="gradient-text">Farcaster Hooks</span>
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              AI-powered hook generation using real Base channel trends.
              Blind selection mechanism ensures authentic engagement.
            </p>
            
            <div className="pt-8">
              <WalletConnect onConnected={handleConnected} />
            </div>

            {/* Features */}
            <div className="grid md:grid-cols-3 gap-6 pt-12">
              <div className="card">
                <div className="text-3xl mb-3">🎯</div>
                <h3 className="font-semibold mb-2">Blind Selection</h3>
                <p className="text-sm text-gray-400">
                  See hooks only. Full content revealed after selection.
                </p>
              </div>
              
              <div className="card">
                <div className="text-3xl mb-3">📈</div>
                <h3 className="font-semibold mb-2">Trend-Jacking</h3>
                <p className="text-sm text-gray-400">
                  Powered by real Base channel engagement data.
                </p>
              </div>
              
              <div className="card">
                <div className="text-3xl mb-3">⛓️</div>
                <h3 className="font-semibold mb-2">Onchain Premium</h3>
                <p className="text-sm text-gray-400">
                  Subscribe onchain for unlimited hook generation.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Topic Selection */}
        {appState === 'topic' && (
          <TopicSelector
            walletAddress={address!}
            onTopicSelected={handleTopicSelected}
          />
        )}

        {/* Hook Selection */}
        {appState === 'hooks' && (
          <HookSelector
            walletAddress={address!}
            topic={topic}
            hooks={hooks}
            isPremium={isPremium}
            currentQuota={quota ?? 0}
            onHookSelected={handleHookSelected}
            onBack={() => setAppState('topic')}
          />
        )}

        {/* Content Reveal */}
        {appState === 'content' && (
          <ContentReveal
            hook={selectedHook}
            fullContent={fullContent}
            onReset={handleReset}
          />
        )}
      </div>

      {/* Footer */}
      <footer className="border-t border-[#2a2a2a] mt-20 py-8">
        <div className="max-w-6xl mx-auto px-4 text-center text-gray-400 text-sm">
          <p>Built for Base Hackathon • Powered by Eigen AI & Gemini</p>
          <p className="mt-2">
            <a href="https://docs.base.org" className="hover:text-white transition">
              Base Docs
            </a>
            {' • '}
            <a href="https://docs.farcaster.xyz" className="hover:text-white transition">
              Farcaster Docs
            </a>
          </p>
        </div>
      </footer>
    </main>
  );
}
