'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAccount } from 'wagmi';
import UIBackground from './components/UIBackground';
import WalletConnect from './components/WalletConnect';
import NameInputModal from './components/NameInputModal';
import HooksSelection from './components/HookSelection';
import TransactionModal from './components/TransactionModal';
import HookResult from './components/HookResult';
import SplashScreen from './components/SplashScreen';

import { TOPIC_PROMPTS, type TopicKey } from './config/topicPrompts';
import { userStorage } from '../utils/userStorage';

type Hook = {
  id: string;
  username: string;
  topic: string;
  content: string;
  preview: string;
};

type AppState = 'initial' | 'selecting' | 'result';

export default function Home() {
  const { isConnected, address } = useAccount();
  const [prompt, setPrompt] = useState('');
  const [activeTopic, setActiveTopic] = useState<TopicKey | null>(null);
  const [credits, setCredits] = useState(5);
  const [appState, setAppState] = useState<AppState>('initial');
  const [selectedHook, setSelectedHook] = useState<Hook | null>(null);
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [pendingHook, setPendingHook] = useState<Hook | null>(null);
  const [showSplash, setShowSplash] = useState(true);
  const [isThinking, setIsThinking] = useState(false);

  // User name management
  const [userName, setUserName] = useState<string>('');
  const [showNameModal, setShowNameModal] = useState(false);
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  // Load user data dari localStorage ketika connect wallet
  useEffect(() => {
    if (!isConnected || !address) {
      // Reset state ketika disconnect
      setUserName('');
      setCredits(5);
      setIsDataLoaded(false);
      setShowNameModal(false);
      return;
    }

    // Load user data
    const userData = userStorage.getUserData(address);

    if (userData && userData.name) {
      // User sudah terdaftar - load data mereka
      setUserName(userData.name);
      setCredits(userData.credits);
      setShowNameModal(false);
    } else {
      // User baru - minta nama
      setUserName('');
      setCredits(5);
      setShowNameModal(true);
    }

    setIsDataLoaded(true);
  }, [isConnected, address]);

  // Handler untuk submit nama user (first time)
  const handleNameSubmit = useCallback((name: string) => {
    if (!address) return;

    setUserName(name);
    
    // Save ke localStorage
    userStorage.saveUserData(address, {
      name,
      credits: 5, // Initial credits untuk user baru
    });
    
    setShowNameModal(false);
  }, [address]);

  // Handler untuk submit prompt
  const handleSubmit = () => {
    if (!activeTopic) return;

    setIsThinking(true);

    setTimeout(() => {
      setIsThinking(false);
      setAppState('selecting');
    }, 1800);
  };

  // Handler ketika user pilih hook
  const handleSelectHook = useCallback((hook: Hook) => {
    const updatedHook = {
      ...hook,
      username: userName || 'Anonymous'
    };
    setPendingHook(updatedHook);
    setShowTransactionModal(true);
  }, [userName]);

  // Handler setelah transaksi sukses
  const handleTransactionSuccess = useCallback(() => {
    if (!address) return;

    setShowTransactionModal(false);

    // Kurangi credits dan simpan ke localStorage
    const hasCredits = credits > 0;
    
    if (hasCredits) {
      const newCredits = Math.max(0, credits - 1);
      setCredits(newCredits);
      userStorage.updateCredits(address, newCredits);
    }

    // Set hook yang dipilih dan pindah ke halaman result
    if (pendingHook) {
      setSelectedHook(pendingHook);
      setAppState('result');
      setPendingHook(null);
    }
  }, [credits, pendingHook, address]);

  // Handler untuk try another hooks
  const handleTryAnother = useCallback(() => {
    setAppState('initial');
    setSelectedHook(null);
    setPrompt('');
    setActiveTopic(null);
  }, []);

  // Handler untuk kembali ke initial
  const handleBack = useCallback(() => {
    setAppState('initial');
    setPrompt('');
  }, []);

  const suggestions = [
    'Holiday',
    'Travel',
    'Business',
    'Tech',
    'Lifestyle',
    'Finance',
    'Health'
  ];

  // Splash Screen
  if (showSplash) {
    return <SplashScreen onFinish={() => setShowSplash(false)} />;
  }

  // Loading state saat data belum loaded
  if (isConnected && !isDataLoaded) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-white">Loading...</div>
      </main>
    );
  }

  return (
    <>
      <main className="min-h-screen flex flex-col bg-black">
        <div className="relative w-full min-h-screen bg-[#0A0A0A] overflow-hidden flex flex-col">

          <UIBackground />

          <div className="relative z-10 flex-1 flex flex-col">

            {!isConnected ? (
              // ========================================
              // HALAMAN 1: SEBELUM CONNECT WALLET
              // ========================================
              <>
                <div className="flex-1 flex flex-col items-center justify-center px-6">
                  <p className="text-white/60 text-sm mb-3 font-medium tracking-wide">
                    HookLab assistant
                  </p>
                  <h1 className="text-white text-3xl font-bold text-center leading-snug font-poppins">
                    Please Connect <br />
                    Wallet, First !
                  </h1>
                </div>

                <div className="relative z-20 w-full px-4 pb-12 mt-auto">
                  <div className="w-full bg-white rounded-[20px] p-5 shadow-lg min-h-[140px] flex flex-col justify-between">
                    <div className="flex items-center">
                      <WalletConnect isConnected={false} />
                    </div>
                  </div>
                </div>
              </>
            ) : appState === 'selecting' ? (
              // ========================================
              // HALAMAN 3: HOOK SELECTION
              // ========================================
              <HooksSelection
                onSelectHook={handleSelectHook}
                onBack={handleBack}
                userName={userName}
              />
            ) : appState === 'result' && selectedHook ? (
              // ========================================
              // HALAMAN 4: HOOK RESULT
              // ========================================
              <HookResult
                hook={selectedHook}
                onTryAnother={handleTryAnother}
              />
            ) : (
              // ========================================
              // HALAMAN 2: SETELAH CONNECT WALLET (INITIAL)
              // ========================================
              <>
                {/* Header dengan Logo */}
                <div className="pt-12 px-6 flex items-center gap-3">
                  <div className="relative w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                    <img src="/logo_hooklab.jpg" alt="Logo HookLab AI" className="w-full h-full rounded-full object-cover" />
                  </div>
                  <span className="text-white font-bold text-xl font-poppins tracking-wide">
                    HookLab AI
                  </span>
                </div>

                {/* Tengah - Greeting & Suggestions */}
                <div className="flex-1 flex flex-col items-center justify-center px-6 -mt-10">
                  <p className="text-white/60 text-sm mb-2 font-medium tracking-wide">
                    HookLab assistant
                  </p>
                  <h1 className="text-white text-2xl font-bold text-center leading-snug font-poppins mb-8">
                    Hello <span className="text-blue-400">{userName || 'there'}</span>, <br />
                    How can i help you today ?
                  </h1>

                  {/* Suggestion Chips */}
                  <div className="flex flex-wrap gap-2 justify-center max-w-[320px]">
                    {suggestions.map((suggestion, index) => {
                      const topic = suggestion as TopicKey;
                      const isActive = activeTopic === topic;

                      return (
                        <button
                          key={index}
                          onClick={() => {
                            setActiveTopic(topic);
                            setPrompt(TOPIC_PROMPTS[topic]);
                          }}
                          className={`px-5 py-2 rounded-full text-sm font-medium transition
                            ${isActive
                              ? 'bg-blue-600 text-white'
                              : 'bg-white text-black hover:bg-gray-100'}
                          `}
                        >
                          {suggestion}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Bawah - Card dengan Input & Credits */}
                <div className="relative z-20 w-full px-4 pb-12 mt-auto">
                  <div className="w-full bg-white rounded-[20px] p-5 shadow-lg">
                    {/* Input Area dengan Send Button */}
                    <div className="mb-3 relative">
                      <textarea
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSubmit();
                          }
                        }}
                        placeholder="What do you want to post about?"
                        className="w-full h-20 resize-none border-none outline-none text-sm text-gray-700 placeholder:text-gray-400 pr-12"
                      />

                      {/* Send Button - Arrow Up */}
                      <button
                        onClick={() => handleSubmit()}
                        disabled={!prompt.trim()}
                        className="absolute bottom-2 right-2 w-8 h-8 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 rounded-full flex items-center justify-center transition-colors disabled:cursor-not-allowed"
                      >
                        <svg
                          className="w-5 h-5 text-white"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 10l7-7m0 0l7 7m-7-7v18"
                          />
                        </svg>
                      </button>
                    </div>

                    {/* Bottom Actions */}
                    <div className="flex items-center gap-3">
                      <WalletConnect isConnected={true} />

                      <div className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-full">
                        <span className="text-sm font-bold text-gray-700">
                          Credits: {credits}/5
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </main>

      {/* Name Input Modal - Hanya untuk user baru */}
      <NameInputModal
        isOpen={showNameModal}
        onSubmit={handleNameSubmit}
      />

      {/* Transaction Modal */}
      <TransactionModal
        isOpen={showTransactionModal}
        onClose={() => {
          setShowTransactionModal(false);
          setPendingHook(null);
        }}
        onSuccess={handleTransactionSuccess}
        hasCredits={credits > 0}
      />
    </>
  );
}