'use client';

// 1. IMPORT WAJIB DI ATAS
import { useState, useEffect, useCallback } from 'react';
import { useAccount } from 'wagmi';
import toast from 'react-hot-toast';

// 2. IMPORT COMPONENTS
// Asumsi file Anda ada di folder components. Sesuaikan path jika berbeda.
import VideoSplash from './components/SplashScreen'; // File SplashScreen.tsx yang isinya VideoSimulation
import LandingPage from './components/LandingPage';  // File LandingPage.tsx yang isinya DomeGlobe
import UIBackground from './components/UIBackground';
import WalletConnect from './components/WalletConnect';
import NameInputModal from './components/NameInputModal';
import HooksSelection from './components/HookSelection';
import TransactionModal from './components/TransactionModal';
import HookResult from './components/HookResult';

import { userStorage } from '../utils/userStorage';

type Hook = {
  id: string;
  username: string;
  topic: string;
  content: string;
  preview: string;
};

// State untuk mengatur tampilan utama aplikasi
type AppView = 'splash' | 'landing' | 'app';
type AppState = 'initial' | 'selecting' | 'result';

export default function Home() {
  // ==========================================
  // STATE NAVIGASI GLOBAL (Splash -> Landing -> App)
  // ==========================================
  const [currentView, setCurrentView] = useState<AppView>('splash');
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  const handleModelLoaded = useCallback(() => {
    setIsModelLoaded(true);
  }, []);

  // Logic untuk Transisi Otomatis dari Splash ke Landing
  useEffect(() => {
    // Wait for BOTH splash view AND model loaded
    if (currentView === 'splash' && isModelLoaded) {
      // 1. Wait 3 seconds, then start exiting
      const timer = setTimeout(() => {
        setIsExiting(true);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [currentView, isModelLoaded]);

  // Handle exiting transition
  useEffect(() => {
    if (isExiting) {
      // 2. Wait 1 second for fade out, then switch view
      const timer = setTimeout(() => {
        setCurrentView('landing');
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isExiting]);

  // Handler saat user klik "Get Started" di Landing Page
  const handleEnterApp = () => {
    setCurrentView('app');
  };

  // ==========================================
  // LOGIC MAIN APP (Sama seperti sebelumnya)
  // ==========================================
  const { isConnected, address } = useAccount();
  const [prompt, setPrompt] = useState('');
  const [activeTopic, setActiveTopic] = useState<string | null>(null);
  const [credits, setCredits] = useState(1000);
  const [appState, setAppState] = useState<AppState>('initial');
  const [userName, setUserName] = useState<string>('');
  const [generatedHooks, setGeneratedHooks] = useState<Hook[]>([]);
  const [isThinking, setIsThinking] = useState(false);
  const [selectedHook, setSelectedHook] = useState<Hook | null>(null);
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [pendingHook, setPendingHook] = useState<Hook | null>(null);
  const [showNameModal, setShowNameModal] = useState(false);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [suggestions, setSuggestions] = useState<{ name: string, prompt: string }[]>([
    { name: 'General', prompt: 'Write a viral hook about...' },
    { name: 'Business', prompt: 'Write a contrarian business lesson about...' }
  ]);

  // Fetch Categories
  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await fetch('/api/categories');
        if (res.ok) {
          const data = await res.json();
          if (data.categories && Array.isArray(data.categories)) {
            setSuggestions(data.categories);
          }
        }
      } catch (e) {
        console.error("Failed to fetch categories:", e);
      }
    }
    fetchCategories();
  }, []);

  // Logic AI Generator
  const handleGenerateHooks = async (promptText: string) => {
    setIsThinking(true);
    const toastId = toast.loading("AI is thinking...", {
      style: { background: '#222', color: '#fff' }
    });

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: activeTopic || 'General',
          userPrompt: promptText
        }),
      });

      if (!response.ok) throw new Error(`Server Error: ${response.status}`);
      const data = await response.json();

      if (data.hooks && Array.isArray(data.hooks)) {
        const formattedHooks: Hook[] = data.hooks.map((item: any, i: number) => {
          const contentText = typeof item === 'string' ? item : item.hook;
          const words = contentText.split(/\s+/);
          const previewText = words.length > 10 ? words.slice(0, 10).join(' ') + '...' : contentText;

          return {
            id: `ai-${Date.now()}-${i}`,
            username: userName || 'Creator',
            topic: activeTopic || 'General',
            content: contentText,
            preview: previewText
          };
        });

        setGeneratedHooks(formattedHooks);
        setAppState('selecting');
        toast.dismiss(toastId);
        toast.success("Hooks generated successfully!");
      } else {
        throw new Error("Invalid data format from AI");
      }
    } catch (err) {
      const error = err as Error;
      console.error("Generate Error:", error);
      toast.dismiss(toastId);
      toast.error(error.message || "Unknown error");
    } finally {
      setIsThinking(false);
    }
  };

  const handleSubmit = () => {
    if (!prompt.trim()) {
      toast.error("Please enter a topic first!");
      return;
    }
    handleGenerateHooks(prompt);
  };

  // Data User & Storage
  useEffect(() => {
    if (!isConnected || !address) {
      setUserName('');
      setCredits(5);
      setIsDataLoaded(false);
      setShowNameModal(false);
      return;
    }
    const userData = userStorage.getUserData(address);
    if (userData && userData.name) {
      setUserName(userData.name);
      setCredits(userData.credits);
      setShowNameModal(false);
    } else {
      setUserName('');
      setCredits(1000);
      setShowNameModal(true);
    }
    setIsDataLoaded(true);
  }, [isConnected, address]);

  const handleNameSubmit = useCallback((name: string) => {
    if (!address) return;
    setUserName(name);
    userStorage.saveUserData(address, { name, credits: 1000 });
    setShowNameModal(false);
    toast.success(`Welcome, ${name}!`);
  }, [address]);

  const handleSelectHook = useCallback((hook: Hook) => {
    if (credits <= 0) toast.error("You are out of credits!");
    const updatedHook = { ...hook, username: userName || 'Anonymous' };
    setPendingHook(updatedHook);
    setShowTransactionModal(true);
  }, [userName, credits]);

  const handleTransactionSuccess = useCallback(() => {
    if (!address) return;
    setShowTransactionModal(false);
    if (credits > 0) {
      const newCredits = Math.max(0, credits - 1);
      setCredits(newCredits);
      userStorage.updateCredits(address, newCredits);
      toast.success("Transaction successful! Credit used.");
    }
    if (pendingHook) {
      setSelectedHook(pendingHook);
      setAppState('result');
      setPendingHook(null);
    }
  }, [credits, pendingHook, address]);

  const handleTryAnother = useCallback(() => {
    setAppState('initial');
    setSelectedHook(null);
    setPrompt('');
    setActiveTopic(null);
  }, []);

  const handleBack = useCallback(() => {
    setAppState('initial');
    setPrompt('');
  }, []);

  const handleBackToSelection = useCallback(() => {
    setAppState('selecting');
    setSelectedHook(null);
  }, []);

  // ==========================================
  // RENDER UI BERDASARKAN VIEW STATE
  // ==========================================

  // 1. TAMPILKAN SPLASH SCREEN (Video Simulation)
  if (currentView === 'splash') {
    return <VideoSplash onModelLoaded={handleModelLoaded} isExiting={isExiting} />;
  }

  // 2. TAMPILKAN LANDING PAGE (Dome Globe)
  if (currentView === 'landing') {
    return <LandingPage onFinish={handleEnterApp} />;
  }

  // 3. TAMPILKAN MAIN APP (Loading Data Wallet)
  if (isConnected && !isDataLoaded && currentView === 'app') {
    return (
      <main className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-white">Loading data...</div>
      </main>
    );
  }

  // 4. TAMPILKAN MAIN APP (Interface Utama)
  return (
    <>
      <main className="min-h-screen flex flex-col bg-black">
        <div className="relative w-full min-h-screen bg-[#0A0A0A] overflow-hidden flex flex-col">
          <UIBackground />
          <div className="relative z-10 flex-1 flex flex-col">
            {!isConnected ? (
              // UI BELUM CONNECT
              <>
                <div className="flex-1 flex flex-col items-center justify-center px-6">
                  <p className="text-white/60 text-sm mb-3 font-medium tracking-wide">HookLab assistant</p>
                  <h1 className="text-white text-3xl font-bold text-center leading-snug font-poppins">
                    Please Connect <br /> Wallet, First !
                  </h1>
                </div>
                <div className="relative z-20 w-full px-4 pb-12 mt-auto">
                  <div className="w-full bg-white rounded-[20px] p-5 shadow-lg min-h-35 flex flex-col justify-between">
                    <div className="flex items-center"><WalletConnect isConnected={false} /></div>
                  </div>
                </div>
              </>
            ) : appState === 'selecting' ? (
              // UI PILIH HASIL
              <HooksSelection onSelectHook={handleSelectHook} onBack={handleBack} userName={userName} generatedHooks={generatedHooks} />
            ) : appState === 'result' && selectedHook ? (
              // UI HASIL FINAL
              <HookResult hook={selectedHook} onTryAnother={handleTryAnother} onBack={handleBackToSelection} />
            ) : (
              // UI UTAMA (INPUT)
              <>
                <div className="pt-12 px-6 flex items-center gap-3">
                  <div className="relative w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center"><div className="text-white font-bold">HL</div></div>
                  <span className="text-white font-bold text-xl font-poppins tracking-wide">HookLab AI</span>
                </div>
                <div className="flex-1 flex flex-col items-center justify-center px-6 -mt-10">
                  <p className="text-white/60 text-sm mb-2 font-medium tracking-wide">HookLab assistant</p>
                  <h1 className="text-white text-2xl font-bold text-center leading-snug font-poppins mb-8">
                    Hello <span className="text-blue-400">{userName || 'there'}</span>, <br /> How can i help you today ?
                  </h1>
                  <div className="flex flex-wrap gap-2 justify-center max-w-[320px]">
                    {suggestions.map((item, index) => {
                      const topic = item.name;
                      const promo = item.prompt;
                      const isActive = activeTopic === topic;
                      return (
                        <button
                          key={index}
                          onClick={() => { setActiveTopic(topic); setPrompt(promo); }}
                          disabled={isThinking}
                          className={`px-5 py-2 rounded-full text-sm font-medium transition ${isActive ? 'bg-blue-600 text-white' : 'bg-white text-black hover:bg-gray-100'}`}
                        >
                          {topic}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div className="relative z-20 w-full px-4 pb-12 mt-auto">
                  <div className="w-full bg-white rounded-[20px] p-5 shadow-lg">
                    <div className="mb-3 relative">
                      <textarea
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        disabled={isThinking}
                        onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit(); } }}
                        placeholder="What do you want to post about?"
                        className="w-full h-20 resize-none border-none outline-none text-sm text-gray-700 placeholder:text-gray-400 pr-12 disabled:opacity-50"
                      />
                      <button onClick={handleSubmit} disabled={!prompt.trim() || isThinking} className="absolute bottom-2 right-2 w-8 h-8 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 rounded-full flex items-center justify-center transition-colors disabled:cursor-not-allowed">
                        {isThinking ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> :
                          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>}
                      </button>
                    </div>
                    <div className="flex items-center gap-3">
                      <WalletConnect isConnected={true} />
                      <div className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-full">
                        <span className="text-sm font-bold text-gray-700">Credits: {credits}/5</span>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </main>
      <NameInputModal isOpen={showNameModal} onSubmit={handleNameSubmit} />
      <TransactionModal isOpen={showTransactionModal} onClose={() => { setShowTransactionModal(false); setPendingHook(null); }} onSuccess={handleTransactionSuccess} hasCredits={credits > 0} />
    </>
  );
}