'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useAccount, useConnect, useDisconnect } from 'wagmi';

type WalletConnectProps = {
  isConnected?: boolean;
  showModal?: boolean;
};

export default function WalletConnect({ isConnected, showModal = false }: WalletConnectProps) {
  const [showWalletModal, setShowWalletModal] = useState(showModal);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const { connect, connectors, isPending } = useConnect();
  const { isConnected: accountConnected, address } = useAccount();
  const { disconnect } = useDisconnect();

  // Check if Metamask is installed (computed on render)
  const hasMetamask = typeof window !== 'undefined' &&
    typeof window.ethereum !== 'undefined' &&
    window.ethereum?.isMetaMask === true;

  // Debug: Log available connectors
  useEffect(() => {
    console.log('Metamask Detection:', {
      hasEthereum: typeof window !== 'undefined' && typeof window.ethereum !== 'undefined',
      isMetaMask: typeof window !== 'undefined' && window.ethereum?.isMetaMask,
      ethereum: typeof window !== 'undefined' ? window.ethereum : undefined
    });

    console.log('Available connectors:', connectors.map(c => ({
      id: c.id,
      name: c.name,
      type: c.type,
      ready: c.ready
    })));


  }, [connectors]);

  const handleConnectMetamask = async () => {
    try {
      setIsConnecting(true);
      setError(null);

      // Check if Metamask is installed
      if (typeof window.ethereum === 'undefined' || !window.ethereum.isMetaMask) {
        setError('MetaMask is not installed! Please install MetaMask extension.');
        setIsConnecting(false);
        // Redirect to Metamask download
        setTimeout(() => {
          window.open('https://metamask.io/download/', '_blank');
        }, 2000);
        return;
      }

      // Find injected connector (Metamask)
      const metamaskConnector = connectors.find(c => c.type === 'injected' || c.id.includes('injected'));

      console.log('Attempting Metamask connection with connector:', metamaskConnector);

      if (!metamaskConnector) {
        setError('MetaMask connector not found. Please refresh the page.');
        setIsConnecting(false);
        return;
      }

      // Connect to Metamask
      await connect({ connector: metamaskConnector });
      setShowWalletModal(false);
      setIsConnecting(false);
    } catch (err) {
      console.error('Metamask connection error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to connect to MetaMask';
      setError(errorMessage);
      setIsConnecting(false);
    }
  };

  const handleConnectCoinbase = async () => {
    try {
      setIsConnecting(true);
      setError(null);

      // Find Coinbase connector
      const coinbaseConnector = connectors.find(c =>
        c.type === 'coinbaseWallet' ||
        c.id.includes('coinbase')
      );

      console.log('Attempting Coinbase connection with connector:', coinbaseConnector);

      if (!coinbaseConnector) {
        setError('Coinbase Wallet connector not found');
        setIsConnecting(false);
        return;
      }

      await connect({ connector: coinbaseConnector });
      setShowWalletModal(false);
      setIsConnecting(false);
    } catch (err) {
      console.error('Coinbase connection error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to connect to Coinbase Wallet';
      setError(errorMessage);
      setIsConnecting(false);
    }
  };

  const handleDisconnect = () => {
    disconnect();
    setShowWalletModal(false);
  };

  // Helper for address truncation
  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };
  
  // Helper for avatar gradient
  const getAvatarGradient = (addr: string) => {
    const gradients = [
      'from-blue-500 to-purple-600',
      'from-emerald-500 to-teal-600',
      'from-orange-500 to-red-600',
      'from-pink-500 to-rose-600'
    ];
    const index = parseInt(addr.slice(2, 4), 16) % gradients.length;
    return gradients[index];
  };

  const handleCopyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address);
    }
  };

  // 1. CONNECTED STATE (Disconnect Modal)
  if (accountConnected && address) {
    return (
      <>
        {/* TRIGGER BUTTON (Dark Glass) */}
        <button
          onClick={() => setShowWalletModal(true)}
          className="group flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full transition-all backdrop-blur-md"
        >
          <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
          <span className="text-white/90 text-sm font-medium font-mono">
            {formatAddress(address)}
          </span>
        </button>

        {/* MODAL: ACCOUNT INFO & DISCONNECT */}
        {showWalletModal && mounted && createPortal(
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="relative bg-[#0A0A0A] border border-white/10 rounded-[32px] p-6 w-full max-w-[320px] shadow-2xl flex flex-col items-center animate-in zoom-in-95 duration-200">
              
              {/* Close Button */}
              <button
                onClick={() => setShowWalletModal(false)}
                className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-white/5 text-white/40 hover:text-white hover:bg-white/10 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              {/* Avatar Circle */}
              <div className={`w-20 h-20 rounded-full bg-gradient-to-br ${getAvatarGradient(address)} flex items-center justify-center mb-4 shadow-[0_0_20px_rgba(0,0,0,0.5)] border-4 border-[#121212]`}>
                <span className="text-2xl font-bold text-white drop-shadow-md">
                  {address.slice(2, 4).toUpperCase()}
                </span>
              </div>

              {/* Address */}
              <h3 className="text-lg font-bold text-white mb-1 font-mono tracking-tight">
                {formatAddress(address)}
              </h3>
              <p className="text-[10px] text-green-400 font-bold tracking-widest uppercase mb-8 bg-green-500/10 px-2 py-1 rounded-full border border-green-500/20">
                Connected
              </p>

              {/* Action Buttons */}
              <div className="w-full space-y-3">
                <button
                  onClick={handleCopyAddress}
                  className="w-full flex items-center justify-center gap-2 py-3.5 bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 rounded-xl text-white/70 hover:text-white transition-all font-medium text-sm"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  Copy Address
                </button>

                <button
                  onClick={() => {
                    disconnect();
                    setShowWalletModal(false);
                  }}
                  className="w-full py-3.5 bg-red-500/10 hover:bg-red-500/20 text-red-500 hover:text-red-400 border border-red-500/20 hover:border-red-500/40 rounded-xl font-bold transition-all text-sm"
                >
                  Disconnect Wallet
                </button>
              </div>

            </div>
          </div>,
          document.body
        )}
      </>
    );
  }



  // Jika belum connected
  return (
    <>
      <button
        onClick={() => setShowWalletModal(true)}
        disabled={isConnecting}
        className="group flex items-center gap-2 px-4 py-2
        rounded-full
        bg-white/10 hover:bg-white/20
        backdrop-blur-md
        border border-blue-200/50 border-s-blue-200/70 border-e-blue-200/70
        shadow-xl shadow-blue-500/20
        transition-all duration-200 ease-out
        hover:-translate-y-[1px]
        hover:shadow-xl hover:shadow-blue-500/30
        hover:border-blue-200/40 hover:border-s-blue-200/60 hover:border-e-blue-200/60
        active:translate-y-0 active:scale-[0.98]
        disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <div className="w-2 h-2 rounded-full shrink-0 bg-red-600" />
        <span className="bg-gradient-to-r from-gray-600 via-gray-500 to-gray-600 bg-clip-text text-transparent text-sm font-bold group-hover:text-blue-500">
          {isConnecting ? 'Connecting...' : 'Connect Wallet'}
        </span>
      </button>

      {/* MODAL: SELECT WALLET */}
      {showWalletModal && mounted && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#0A0A0A] border border-white/10 rounded-[32px] p-6 w-full max-w-[340px] shadow-2xl animate-in zoom-in-95 duration-200 relative">
             <button
                onClick={() => {
                  setShowWalletModal(false);
                  setError(null);
                }}
                className="absolute top-5 right-5 text-white/40 hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

            <div className="mb-8 mt-2">
              <h3 className="text-xl font-bold text-white font-poppins text-center">
                Connect Wallet
              </h3>
              <p className="text-white/40 text-xs text-center mt-1">
                Choose your preferred wallet
              </p>
            </div>

            {/* Metamask Status Indicator */}
            {!hasMetamask && (
              <div className="mb-4 p-3 bg-orange-500/10 border border-orange-500/20 rounded-xl">
                <p className="text-sm text-orange-400 font-bold">⚠️ MetaMask not detected</p>
                <p className="text-xs text-orange-500/80 mt-1">Please install MetaMask extension first</p>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
                <p className="text-sm text-red-400">{error}</p>
              </div>
            )}

            <div className="space-y-3">
              {/* Tombol Metamask */}
              <button
                onClick={handleConnectMetamask}
                disabled={isConnecting}
                className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all border group relative overflow-hidden ${hasMetamask
                  ? 'bg-white/5 hover:bg-white/10 border-white/5 hover:border-white/10'
                  : 'bg-white/5 border-white/5 opacity-50 cursor-not-allowed'
                  }`}
              >
                <div className="w-10 h-10 bg-[#151515] rounded-xl flex items-center justify-center shrink-0 border border-white/5 shadow-inner">
                  <svg className="w-6 h-6 text-orange-500" viewBox="0 0 40 40" fill="currentColor">
                    <path d="M32.5 5L20 14.5 22.5 9.5 32.5 5z" />
                    <path d="M7.5 5L20 14.5 17.5 9.5 7.5 5z" />
                    <path d="M27.5 29L25 33.5 32 35.5 34 29 27.5 29z" />
                    <path d="M6 29L8 35.5 15 33.5 12.5 29 6 29z" />
                  </svg>
                </div>
                <div className="flex-1 text-left">
                  <p className="font-bold text-white group-hover:text-white transition-colors">MetaMask</p>
                  <p className="text-xs text-white/40">
                    {hasMetamask ? 'Connect to MetaMask' : 'Not installed'}
                  </p>
                </div>
                {hasMetamask && (
                  <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
                )}
              </button>

              {/* Tombol Coinbase */}
              <button
                onClick={handleConnectCoinbase}
                disabled={isConnecting}
                className="w-full flex items-center gap-4 p-4 bg-white/5 hover:bg-white/10 rounded-2xl transition-all border border-white/5 hover:border-white/10 disabled:opacity-50 group"
              >
                <div className="w-10 h-10 bg-[#151515] rounded-xl flex items-center justify-center shrink-0 border border-white/5 shadow-inner">
                  <svg className="w-6 h-6 text-blue-500" viewBox="0 0 28 28" fill="currentColor">
                    <circle cx="14" cy="14" r="14" />
                    <path d="M14 4C8.5 4 4 8.5 4 14s4.5 10 10 10 10-4.5 10-10S19.5 4 14 4zm0 18c-4.4 0-8-3.6-8-8s3.6-8 8-8 8 3.6 8 8-3.6 8-8 8z" fill="white" />
                    <path d="M11 13h6v2h-6z" fill="white" />
                  </svg>
                </div>
                <div className="flex-1 text-left">
                  <p className="font-bold text-white group-hover:text-white transition-colors">Coinbase Wallet</p>
                  <p className="text-xs text-white/40">Connect to Coinbase</p>
                </div>
              </button>
            </div>

            {isConnecting && (
              <div className="mt-6 text-center">
                <div className="inline-block animate-spin rounded-full h-5 w-5 border-2 border-blue-500 border-t-transparent"></div>
                <p className="text-sm text-white/50 mt-2">Connecting...</p>
              </div>
            )}

            <p className="text-[10px] text-white/20 text-center mt-6">
              By connecting, you agree to our Terms of Service
            </p>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}