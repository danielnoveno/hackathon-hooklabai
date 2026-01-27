'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAccount } from 'wagmi';
import UIBackground from './components/UIBackground';
import WalletConnect from './components/WalletConnect';
import NameInputModal from './components/NameInputModal';
import HooksSelection from './components/HookSelection';
import TransactionModal from './components/TransactionModal';
import HookResult from './components/HookResult';

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
  const [credits, setCredits] = useState(5);
  const [appState, setAppState] = useState<AppState>('initial');
  const [selectedHook, setSelectedHook] = useState<Hook | null>(null);
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [pendingHook, setPendingHook] = useState<Hook | null>(null);
  
  // User name management - Initialize with check
  const [userName, setUserName] = useState<string>('');
  const [showNameModal, setShowNameModal] = useState(false);
  const [nameInitialized, setNameInitialized] = useState(false);

  // Suggestions untuk setelah connect
  const suggestions = [
    'Holiday',
    'Travel',
    'Business',
    'Tech',
    'Lifestyle',
    'Finance',
    'Health'
  ];

  // Check localStorage untuk nama user - Optimized approach
  useEffect(() => {
    if (!isConnected || !address) {
      // Reset state when disconnected
      if (nameInitialized) {
        setUserName('');
        setShowNameModal(false);
        setNameInitialized(false);
      }
      return;
    }

    // Only check once per connection
    if (nameInitialized) return;

    // Use queueMicrotask to defer state updates
    queueMicrotask(() => {
      const storedName = localStorage.getItem(`userName_${address}`);
      
      if (storedName) {
        setUserName(storedName);
      } else {
        // First time user - ask for name
        setShowNameModal(true);
      }
      
      setNameInitialized(true);
    });
  }, [isConnected, address, nameInitialized]);

  // Handler untuk submit nama user
  const handleNameSubmit = useCallback((name: string) => {
    setUserName(name);
    if (address) {
      localStorage.setItem(`userName_${address}`, name);
    }
    setShowNameModal(false);
  }, [address]);

  // Handler untuk submit prompt
  const handleSubmit = useCallback((e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!prompt.trim()) return;
    
    console.log('Prompt:', prompt);
    // TODO: Call API untuk generate hooks
    // Untuk sekarang, langsung pindah ke halaman selection
    setAppState('selecting');
  }, [prompt]);

  // Handler ketika user pilih hook
  const handleSelectHook = useCallback((hook: Hook) => {
    // Update hook dengan username dari user
    const updatedHook = {
      ...hook,
      username: userName || 'Anonymous'
    };
    setPendingHook(updatedHook);
    setShowTransactionModal(true);
  }, [userName]);

  // Handler setelah transaksi sukses
  const handleTransactionSuccess = useCallback(() => {
    setShowTransactionModal(false);
    
    // Kurangi credits jika masih ada
    if (credits > 0) {
      setCredits(prev => Math.max(0, prev - 1));
    }
    
    // Set hook yang dipilih dan pindah ke halaman result
    if (pendingHook) {
      setSelectedHook(pendingHook);
      setAppState('result');
      setPendingHook(null);
    }
  }, [credits, pendingHook]);

  // Handler untuk try another hooks
  const handleTryAnother = useCallback(() => {
    setAppState('initial');
    setSelectedHook(null);
    setPrompt('');
  }, []);

  // Handler untuk kembali ke initial
  const handleBack = useCallback(() => {
    setAppState('initial');
    setPrompt('');
  }, []);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-black">
      <div className="relative w-full max-w-[400px] min-h-screen md:h-[844px] bg-[#0A0A0A] overflow-hidden shadow-2xl flex flex-col">
        
        <UIBackground />

        <div className="relative z-10 flex-1 flex flex-col h-full">
          
          {/* CONDITIONAL RENDERING BERDASARKAN APP STATE */}
          
          {!isConnected ? (
            // ========================================
            // HALAMAN 1: SEBELUM CONNECT WALLET
            // ========================================
            <>
              {/* Tengah - Pesan Connect Wallet */}
              <div className="flex-1 flex flex-col items-center justify-center px-6">
                <p className="text-white/60 text-sm mb-3 font-medium tracking-wide">
                  AI assistant
                </p>
                <h1 className="text-white text-3xl font-bold text-center leading-snug font-poppins">
                  Please Connect <br />
                  Wallet, First !
                </h1>
              </div>

              {/* Bawah - Card dengan Tombol Connect */}
              <div className="relative z-20 w-full px-4 pb-12 mt-auto">
                <div className="w-full bg-white rounded-[20px] p-5 shadow-lg min-h-[140px] flex flex-col justify-between">
                  
                  <div className="flex items-center">
                    <WalletConnect isConnected={false} />
                  </div>
                </div>
                
                {/* Bottom Indicator */}
                <div className="w-full flex justify-center mt-8">
                  <div className="w-[130px] h-[5px] bg-white/20 rounded-full" />
                </div>
              </div>
            </>
          ) : appState === 'selecting' ? (
            // ========================================
            // HALAMAN 3: HOOKS SELECTION
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
                  <img src="/logo_hooklab.jpg" alt="Logo HookLab AI" />
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
                  {suggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => setPrompt(suggestion)}
                      className="px-5 py-2 bg-white rounded-full text-black text-sm font-medium hover:bg-gray-100 transition-colors"
                    >
                      {suggestion}
                    </button>
                  ))}
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

      {/* Name Input Modal */}
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
    </main>
  );
}