'use client';

// 1. IMPORT WAJIB DI ATAS
import { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';
import { useAccount, useSendTransaction, useWaitForTransactionReceipt, useSwitchChain, useChainId } from 'wagmi';
import { parseEther } from 'viem';
import toast from 'react-hot-toast';
import { formatEther } from 'viem';
import { HOOK_TOKEN_ABI, HOOKLAB_REWARDS_ABI } from './config/abi';

// IMPORT DRIVER.JS
import { driver } from "driver.js";
import "driver.js/dist/driver.css";

// 2. IMPORT COMPONENTS
import VideoSplash from './components/SplashScreen';
import LandingPage from './components/LandingPage';
import UIBackground from './components/UIBackground';
import WalletConnect from './components/WalletConnect';
import NameInputModal from './components/NameInputModal';
import HooksSelection from './components/HookSelection';
import TransactionModal from './components/TransactionModal';
// HookResult component is defined internally in this file
import DecryptedText from './components/DecryptedText';
import BubbleMenu from './components/BubbleMenu';
import HistoryModal from './components/HistoryModal';

import { userStorage } from '../utils/userStorage';

import SplitText from "../components/SplitText";
import ShinyText from "../components/ShinyText"; // Ensure correct path

// ... (Definisi HookResult ada di bawah komponen Home agar rapi)

const handleAnimationComplete = () => {
  console.log('All letters have animated!');
};

type Hook = {
  id: string;
  username: string;
  topic: string;
  content: string;
  preview: string;
};

type AppView = 'splash' | 'landing' | 'app';
type AppState = 'initial' | 'selecting' | 'result';

// --- REUSABLE HEADER COMPONENT ---
function AppHeader({ className = "" }: { className?: string }) {
  return (
    <div className={`flex justify-center w-full z-50 ${className}`}>
      <div className="flex items-center gap-3 px-6 py-3 bg-white/5 backdrop-blur-md border border-white/10 rounded-full shadow-lg">
        <div className="relative w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center p-[1px]">
          <div className="w-full h-full rounded-full bg-black flex items-center justify-center overflow-hidden">
            <img src="/logo_hooklab.png" alt="HookLab" className="w-full h-full object-cover" />
          </div>
        </div>
        <span className="text-white font-bold text-lg font-poppins tracking-wide">HookLab AI</span>
      </div>
    </div>
  );
}

export default function Home() {
  const [currentView, setCurrentView] = useState<AppView>('splash');
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [isExiting, setIsExiting] = useState(false);


  // --- DRIVER JS REF ---
  const driverObj = useRef<any>(null);
  const [isTourActive, setIsTourActive] = useState(false);

  const handleModelLoaded = useCallback(() => {
    setIsModelLoaded(true);
  }, []);

  useEffect(() => {
    if (currentView === 'splash' && isModelLoaded) {
      const timer = setTimeout(() => {
        setIsExiting(true);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [currentView, isModelLoaded]);

  useEffect(() => {
    if (isExiting) {
      const timer = setTimeout(() => {
        setCurrentView('landing');
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isExiting]);

  const handleEnterApp = () => {
    setCurrentView('app');
  };

  // ==========================================
  // LOGIC MAIN APP
  // ==========================================
  const { isConnected, address } = useAccount();
  const [prompt, setPrompt] = useState('');
  const [activeTopic, setActiveTopic] = useState<string | null>(null);
  const [credits, setCredits] = useState(5);
  const [appState, setAppState] = useState<AppState>('initial');
  const [userName, setUserName] = useState<string>('');
  const [generatedHooks, setGeneratedHooks] = useState<Hook[]>([]);
  const [isThinking, setIsThinking] = useState(false);
  const [selectedHook, setSelectedHook] = useState<Hook | null>(null);
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [pendingHook, setPendingHook] = useState<Hook | null>(null);
  const [showNameModal, setShowNameModal] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  const [suggestions, setSuggestions] = useState<{ name: string, prompt: string }[]>([
    { name: 'General', prompt: 'Write a viral hook about...' },
    { name: 'Business', prompt: 'Write a contrarian business lesson about...' }
  ]);

  const tokenAddress = process.env.NEXT_PUBLIC_TOKEN_ADDRESS as `0x${string}`;
  const rewardsAddress = process.env.NEXT_PUBLIC_REWARDS_ADDRESS as `0x${string}`;

  // TOKEN HOOKS
  const { data: hookBalance, refetch: refetchBalance } = useReadContract({
    address: tokenAddress,
    abi: HOOK_TOKEN_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
  });

  // Automatically refetch balance periodically or after actions
  useEffect(() => {
    const interval = setInterval(() => refetchBalance(), 10000);
    return () => clearInterval(interval);
  }, [refetchBalance]);

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

  // --- LOGIC TOUR START ---
  useEffect(() => {
    // STRICT CHECK: Pastikan address valid (string) dan kondisi lain terpenuhi
    if (isConnected && isDataLoaded && currentView === 'app' && !showNameModal && address) {
      const tourKey = `hooklab_tour_completed_${address}`;
      const hasToured = localStorage.getItem(tourKey);

      if (!hasToured) {
        // Delay sedikit lebih lama untuk stabilitas render & memastikan tidak ada race condition
        const timer = setTimeout(() => {
          // DOUBLE CHECK: Cek lagi di dalam timeout (karena state/localStorage mungkin berubah)
          const currentKey = `hooklab_tour_completed_${address}`;
          if (!localStorage.getItem(currentKey)) {
            startTourPart1();
          }
        }, 800);
        return () => clearTimeout(timer);
      }
    }
  }, [isConnected, isDataLoaded, currentView, address, showNameModal]);

  const startTourPart1 = () => {
    // LANGSUNG SET SEBAGAI COMPLETED AGAR TIDAK MUNCUL LAGI
    if (address) {
      localStorage.setItem(`hooklab_tour_completed_${address}`, 'true');
    }

    setIsTourActive(true);
    driverObj.current = driver({
      showProgress: true,
      animate: true,
      allowClose: false,
      steps: [
        {
          element: '#tour-auto-prompt',
          popover: {
            title: '1. Prompt Automation',
            description: 'Click a category here to get an instant viral prompt without typing.',
            side: "bottom", align: 'center'
          }
        },
        {
          element: '#tour-manual-input',
          popover: {
            title: '2. Manual Prompt',
            description: 'Or type your specific topic/idea here.',
            side: "top", align: 'center'
          }
        },
        {
          element: '#tour-generate-btn',
          popover: {
            title: '3. Generate',
            description: 'Click this button to create Hooks. (Click now to continue the demo!)',
            side: "left", align: 'center'
          }
        }
      ]
    });
    driverObj.current.drive();
  };

  // TOUR PART 2: SELECTING
  useEffect(() => {
    if (appState === 'selecting' && isTourActive) {
      setTimeout(() => {
        driverObj.current = driver({
          showProgress: true,
          animate: true,
          steps: [
            {
              element: '#tour-hook-list', // Pastikan ID ini ada di HooksSelection.tsx
              popover: {
                title: '4. Select Result',
                description: 'AI generates several options. Select a hook card to view details.',
                side: "top", align: 'center'
              }
            }
          ]
        });
        driverObj.current.drive();
      }, 500);
    }
  }, [appState, isTourActive]);

  // TOUR PART 3: RESULT
  useEffect(() => {
    if (appState === 'result' && isTourActive) {
      setTimeout(() => {
        driverObj.current = driver({
          showProgress: true,
          animate: true,
          steps: [
            {
              element: '#tour-result-content',
              popover: {
                title: '5. Content & Visuals',
                description: 'This is your final content. You can manage text and preview AI visuals here.',
                side: "bottom", align: 'center'
              }
            },
            {
              element: '#tour-action-buttons', // Pastikan ID ini ada di HookResult component (di bawah)
              popover: {
                title: '6. Actions',
                description: 'Copy text, post directly to Base, or generate new visual assets.',
                side: "top", align: 'center',
                doneBtnText: 'Done',
                onNextClick: () => {
                  localStorage.setItem(`hooklab_tour_completed_${address}`, 'true');
                  setIsTourActive(false);
                  driverObj.current.destroy();
                  toast.success("Tour Completed! Happy creating.");
                }
              }
            }
          ]
        });
        driverObj.current.drive();
      }, 500);
    }
  }, [appState, isTourActive, address]);


  const handleNameSubmit = useCallback((name: string) => {
    if (!address) return;
    setUserName(name);
    userStorage.saveUserData(address, { name, credits: 1000 });
    setShowNameModal(false);
    toast.success(`Welcome, ${name}!`);
  }, [address]);

  // Logic AI Generator
  const handleGenerateHooks = async (promptText: string) => {
    if (isTourActive && driverObj.current) driverObj.current.destroy(); // Hide tour during loading

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
          userPrompt: promptText,
          walletAddress: address
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
      setCredits(5);
      setShowNameModal(true);
    }
    setIsDataLoaded(true);
  }, [isConnected, address]);

  const handleNameSubmit = useCallback((name: string) => {
    if (!address) return;
    setUserName(name);
    userStorage.saveUserData(address, { name, credits: 5 });
    setShowNameModal(false);
    toast.success(`Welcome, ${name}!`);
  }, [address]);

  const handleSelectHook = useCallback((hook: Hook) => {
    if (isTourActive && driverObj.current) driverObj.current.destroy();

    if (credits <= 0) toast.error("You are out of credits!");
    const updatedHook = { ...hook, username: userName || 'Anonymous' };
    setPendingHook(updatedHook);
    setShowTransactionModal(true);
  }, [userName, credits, isTourActive]);

  const [historyId, setHistoryId] = useState<string | undefined>(undefined);

  const handleTransactionSuccess = useCallback(async () => {
    if (!address) return;
    setShowTransactionModal(false);
    if (credits > 0) {
      const newCredits = Math.max(0, credits - 1);
      setCredits(newCredits);
      userStorage.updateCredits(address, newCredits);
      toast.success("Transaction successful! Credit used.");
    }
    if (pendingHook) {
      try {
        const res = await fetch('/api/history', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            walletAddress: address,
            prompt: pendingHook.content
          })
        });
        const data = await res.json();
        if (data.historyId) {
          setHistoryId(data.historyId);
        }
      } catch (e) {
        console.error("Failed to save initial history", e);
      }

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
    setHistoryId(undefined); // Reset history context
  }, []);

  // UI Render
  if (currentView === 'splash') {
    return <VideoSplash onModelLoaded={handleModelLoaded} isExiting={isExiting} />;
  }

  if (currentView === 'landing') {
    return <LandingPage onFinish={handleEnterApp} />;
  }

  if (isConnected && !isDataLoaded && currentView === 'app') {
    return (
      <main className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-white">Loading data...</div>
      </main>
    );
  }

  // ... rest of the main component ...

  return (
    <>
      <main className="min-h-screen flex flex-col bg-black">
        <div className="relative w-full min-h-screen bg-[#0A0A0A] overflow-hidden flex flex-col">
          <div className="absolute inset-0 z-0 pointer-events-none">
            <UIBackground />
          </div>
          <div className="relative z-10 flex-1 flex flex-col">
            {!isConnected ? (
              // UI BELUM CONNECT
              <>
                <div className="flex-1 flex flex-col items-center justify-center px-6">
                  <p className="text-white/60 text-sm mb-3 font-medium tracking-wide">HookLab assistant</p>
                  <ShinyText
                    text="Welcome to HookLab!"
                    className="text-white text-3xl font-bold text-center leading-snug font-poppins mb-4"
                    speed={2} delay={0} color="#b5b5b5" shineColor="#ffffff" spread={120} direction="left" yoyo={false} pauseOnHover={false} disabled={false}
                  />
                  <SplitText
                    text="Please Connect Wallet First!"
                    className="text-white/80 text-xl font-medium text-center font-poppins"
                    delay={50} duration={1.0} ease="power3.out" splitType="chars" from={{ opacity: 0, y: 40 }} to={{ opacity: 1, y: 0 }} threshold={0.1} rootMargin="-100px" textAlign="center" onLetterAnimationComplete={handleAnimationComplete}
                  />
                </div>
                <div className="relative z-20 w-full px-4 pb-12 mt-auto">
                  <div className="w-full bg-white rounded-[20px] p-5 shadow-lg min-h-35 flex flex-col justify-between">
                    <div className="flex items-center"><WalletConnect isConnected={false} /></div>
                  </div>
                </div>
              </>
            ) : appState === 'selecting' ? (
              // UI PILIH HASIL 
              // IMPORTANT: Add ID to HooksSelection component wrapping div in HooksSelection.tsx file: <div id="tour-hook-list" ...>
              <div id="tour-hook-list" className="w-full h-full">
                <HooksSelection onSelectHook={handleSelectHook} onBack={handleBack} userName={userName} generatedHooks={generatedHooks} />
              </div>
            ) : appState === 'result' && selectedHook ? (
              // UI HASIL FINAL
              <HookResult
                hook={selectedHook}
                onTryAnother={handleTryAnother}
                onBack={handleBackToSelection}
                initialHistoryId={historyId}
              />
            ) : (
              // UI UTAMA (INPUT)
              <>
                <div className="pt-8 px-6 flex items-center justify-between relative z-50">
                  {/* Left: Logo Pill */}
                  <div className="flex items-center gap-3 px-4 py-2 bg-white/5 backdrop-blur-md border border-white/10 rounded-full shadow-lg">
                    <div className="relative w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center p-[1px]">
                      <div className="w-full h-full rounded-full bg-black flex items-center justify-center overflow-hidden">
                        <img src="/logo_hooklab.png" alt="HookLab" className="w-full h-full object-cover" />
                      </div>
                    </div>
                    <span className="text-white font-bold text-lg font-poppins tracking-wide">HookLab AI</span>
                  </div>

                  {/* Right: History Button */}
                  <button
                    onClick={() => setShowHistory(true)}
                    className="w-10 h-10 flex items-center justify-center text-white/60 hover:text-white transition-colors bg-white/5 rounded-full backdrop-blur-sm border border-white/5"
                    data-tip="History"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </button>
                </div>

                <div className="flex-1 flex flex-col items-center justify-center px-6 -mt-20 relative z-0">
                  <h1 className="text-white text-2xl md:text-3xl font-bold text-center leading-tight font-poppins mb-8 drop-shadow-2xl">
                    Hello <span className="inline-block text-blue-400">
                      <DecryptedText
                        text={userName || 'there'}
                        speed={100} maxIterations={20} useOriginalCharsOnly={true} className="text-blue-400" encryptedClassName="text-blue-400 opacity-50" loop={true} animateOn="view"
                      />
                    </span>, <br />
                    <span className="text-xl md:text-2xl font-normal text-gray-300 mt-2 block">How can i help you today ?</span>
                  </h1>

                  {/* ID UNTUK TOUR STEP 1 */}
                  <div id="tour-auto-prompt" className="relative w-full max-w-2xl mx-auto px-4 mt-4 z-20">
                    <BubbleMenu
                      items={suggestions.map((s, i) => ({
                        label: s.name,
                        ariaLabel: `Select topic ${s.name}`,
                        rotation: (i % 2 === 0 ? -3 : 3) + Math.random() * 4 - 2,
                        active: activeTopic === s.name,
                        hoverStyles: { bgColor: '#2563EB', textColor: '#ffffff' },
                        onClick: () => {
                          if (activeTopic === s.name) {
                            setActiveTopic(null);
                          } else {
                            setActiveTopic(s.name);
                            setPrompt(s.prompt);
                          }
                        }
                      }))}
                      staggerDelay={0.05}
                    />
                  </div>
                  
                  <div className="h-0"></div> 
                </div>

                <div className="relative z-20 w-full max-w-2xl mx-auto px-4 pb-6 mt-auto">
                  {/* Compact Loyalty Progress Bar precisely above Prompt Box */}
                  <div className="w-full mb-2 animate-in fade-in slide-in-from-bottom-2 duration-500">
                    <div className="relative group overflow-hidden bg-white/[0.03] backdrop-blur-md border border-white/5 rounded-xl px-4 py-2 flex items-center justify-between gap-4">
                       <div className="flex items-center gap-3 flex-1 min-w-0">
                            <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest whitespace-nowrap">Loyalty Tracker</span>
                            <div className="h-1 w-1 rounded-full bg-indigo-400 animate-pulse" />
                            <span className="text-[10px] text-white/30 font-medium italic truncate">Persists on-chain</span>
                         </div>
                         <div className="flex items-center gap-2">
                            <span className="text-[8px] text-white/20 uppercase tracking-tighter">1 Pay = 100 HOOK</span>
                            <span className="text-sm font-mono font-bold text-indigo-400">
                              {Number(formatEther(hookBalance || 0n)).toFixed(0)}/500 $HOOK
                            </span>
                         </div>

                       {/* Subtle Shimmer */}
                       <div className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] bg-gradient-to-r from-transparent via-white/[0.02] to-transparent transition-transform duration-1000 pointer-events-none" />
                    </div>
                  </div>

                  {/* GLASS PROMPT BOX - More transparent, lighter border */}
                  <div className="w-full bg-white/5 border border-white/10 rounded-[24px] p-2 shadow-2xl backdrop-blur-md">

                    {/* ID UNTUK TOUR STEP 2 */}
                    <div id="tour-manual-input" className="relative bg-black/20 rounded-[20px] p-4 group focus-within:ring-1 focus-within:ring-white/20 transition-all duration-300">
                      <textarea
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        disabled={isThinking}
                        onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit(); } }}
                        placeholder="Type your topic here or choose a category from the menu..."
                        className="w-full h-24 resize-none bg-transparent border-none outline-none text-base text-white placeholder:text-gray-500 pr-12 disabled:opacity-50 font-sans"
                      />
                      <div className="absolute bottom-3 right-3 flex items-center gap-2">

                        {/* ID UNTUK TOUR STEP 3 */}
                        <button id="tour-generate-btn" onClick={handleSubmit} disabled={!prompt.trim() || isThinking} className="w-10 h-10 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 disabled:text-gray-500 rounded-xl flex items-center justify-center transition-all duration-200 shadow-lg shadow-blue-900/20 disabled:shadow-none transform active:scale-95 disabled:cursor-not-allowed group-hover:shadow-blue-600/30">
                          {isThinking ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> :
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 12h14" /></svg>}
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-3 px-2">
                       <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
                          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                          <span>AI Ready</span>
                       </div>
                       
                       <div className="flex items-center gap-3">
                          <button 
                            onClick={() => setShowHistory(true)}
                            className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-all tooltip tooltip-left"
                            data-tip="History"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </button>
                          
                          <div className="h-4 w-[1px] bg-white/10"></div>
                          
                          <div className="flex items-center gap-2 text-gray-400 text-sm">
                             <WalletConnect isConnected={true} />
                             <div className="flex flex-col items-end gap-1">
                                <span className="bg-white/5 px-2 py-0.5 rounded-md border border-white/5 text-[10px] font-mono text-blue-400">
                                  {credits}/5 Credits
                                </span>
                             </div>
                          </div>
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
      <HistoryModal isOpen={showHistory} onClose={() => setShowHistory(false)} walletAddress={address} />
      <TransactionModal isOpen={showTransactionModal} onClose={() => { setShowTransactionModal(false); setPendingHook(null); }} onSuccess={handleTransactionSuccess} hasCredits={credits > 0} />
    </>
  );
}

// --- HOOK RESULT COMPONENT (Internal Definition) ---
type HookResultProps = {
  hook: Hook;
  onTryAnother: () => void;
  onBack: () => void;
  initialHistoryId?: string; // New Prop
};

function HookResult({ hook, onTryAnother, onBack, initialHistoryId }: HookResultProps) {
  const [copied, setCopied] = useState(false);
  const [showExitWarning, setShowExitWarning] = useState(false);

  // Full content untuk display
  const fullContent = hook.content;

  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string | null>(null);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);
  const [isPaying, setIsPaying] = useState(false);
  const [paymentHash, setPaymentHash] = useState<`0x${string}` | undefined>(undefined);
  const [generationIntent, setGenerationIntent] = useState<'image' | 'video'>('image');

  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { switchChainAsync } = useSwitchChain();
  const { data: hash, sendTransaction, isPending: isConfirmingWallet, error: sendError } = useSendTransaction();

  const { isLoading: isWaitingReceipt, isSuccess: isPaymentSuccess } = useWaitForTransactionReceipt({
    hash: paymentHash,
  });

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
      toast.success("Payment confirmed! Starting generation...", { id: "payment" });
      if (generationIntent === 'video') {
        generateImageAndThenVideo();
      } else {
        generateImageAfterPayment();
      }
      setIsPaying(false);
    }
  }, [isPaymentSuccess]);

  // Generate hashtags (Dynamic based on topic)
  const hashtags = [`#${hook.topic.replace(/\s+/g, '')}`, '#Web3', '#HookLab', '#Farcaster'];

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
    if (!generatedImageUrl) {
      // If no image, we need to generate image first (FULL FLOW)
      setGenerationIntent('video');
      handleGenerateImageCommon(); // Reuse payment flow
      return;
    }

    // If image exists, just animate it
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

  const handleGenerateImageCommon = async () => {
    // Developer Mode: Bypass Payment & Wallet Connection
    if (process.env.NEXT_PUBLIC_MOCK_PAYMENT === 'true') {
      toast.success("Developer Mode: Payment Bypassed");
      if (generationIntent === 'video' && !generatedImageUrl) {
        generateImageAndThenVideo();
      } else {
        generateImageAfterPayment();
      }
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

    // Check if already generated (unless upgrading to video ? logic might vary)
    if (generatedImageUrl && generationIntent === 'image') return;

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

  const handleGenerateImage = () => {
    setGenerationIntent('image');
    handleGenerateImageCommon();
  }

  // Override handleGenerateVideo to also use payment if starting from scratch
  const handleGenerateVideoClick = () => {
    setGenerationIntent('video');
    if (!generatedImageUrl) {
      handleGenerateImageCommon();
    } else {
      handleGenerateVideo();
    }
  }

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
    <div className="flex-1 flex flex-col bg-black overflow-hidden relative w-full h-full">
      {/* Fixed Header */}
      {/* Fixed Header */}
      <div className="absolute top-0 left-0 right-0 z-[100] flex flex-col items-center w-full">
        {/* Stronger Backdrop */}
        <div className="absolute inset-0 bg-black/90 backdrop-blur-3xl border-b border-white/5 -z-10 shadow-2xl" />

        <div className="w-full max-w-md pt-8 px-6 pb-4 flex items-center justify-between relative">
          <button
            onClick={onBack}
            className="w-10 h-10 flex items-center justify-center text-white/60 hover:text-white transition-colors bg-white/5 rounded-full backdrop-blur-sm border border-white/5 z-50 transform hover:scale-105 active:scale-95"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <div className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 pt-4">
            <AppHeader />
          </div>

          <div className="w-10"></div> {/* Spacer for balance */}
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="relative z-10 w-full flex flex-col overflow-y-auto h-full pt-[100px]">
        <div className="flex-1 px-6 pb-6 pt-4">
          <div id="tour-result-content" className="bg-[#1A1A1A] rounded-2xl p-5 border border-white/10 h-full flex flex-col">
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
            <div id="tour-action-buttons" className="flex flex-col gap-3">
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

              {/* Row 2: Generate Visual (Single Button) */}
              {!generatedImageUrl && !generatedVideoUrl && (
                <button
                  onClick={handleGenerateImage}
                  disabled={isGeneratingImage || isConfirmingWallet || isPaying || isWaitingReceipt}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white rounded-xl transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_15px_rgba(147,51,234,0.3)] hover:shadow-[0_0_25px_rgba(147,51,234,0.5)] active:scale-[0.98]"
                >
                  {isGeneratingImage ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                  )}
                  Generate Visual
                </button>
              )}

              {(isConfirmingWallet || isPaying || isWaitingReceipt) && !generatedImageUrl && (
                <div className="w-full py-2 flex items-center justify-center gap-2 text-yellow-400 text-sm">
                  <div className="w-4 h-4 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin"></div>
                  {isConfirmingWallet ? 'Confirm in Wallet...' : 'Processing Payment...'}
                </div>
              )}

              {/* Row 3: Animate Video (Only if Image exists & Video doesn't) - Upgrade option */}
              {generatedImageUrl && !generatedVideoUrl && (
                <button
                  onClick={handleGenerateVideoClick}
                  disabled={isGeneratingVideo}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
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
                      Animate Image (Video)
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Try Another Button - Placed inside scrollable area for accessibility */}
          <div className="px-6 pb-12 pt-6">
            <button
              onClick={onTryAnother}
              className="w-full px-6 py-3 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/10 text-white rounded-2xl font-bold text-lg transition-all active:scale-[0.98] shadow-lg"
            >
              Try Another Hooks
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}