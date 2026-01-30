'use client';

import { useState, useEffect } from 'react';
import { useAccount, useConnect, useDisconnect } from 'wagmi';

type WalletConnectProps = {
  isConnected?: boolean;
  showModal?: boolean;
};

export default function WalletConnect({ isConnected, showModal = false }: WalletConnectProps) {
  const [showWalletModal, setShowWalletModal] = useState(showModal);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  // Jika sudah connected
  if (accountConnected) {
    return (
      <>
        {/* ADDRESS BUTTON (TRIGGER SAJA) */}
        <button
          onClick={() => setShowWalletModal(true)}
          className="group flex items-center gap-2 px-4 py-2 bg-white hover:bg-gray-50 border border-gray-200 rounded-full transition-all"
        >
          <div className="w-2 h-2 rounded-full bg-green-500" />
          <span className="text-gray-700 text-sm font-bold">
            {address?.slice(0, 6)}...{address?.slice(-4)}
          </span>
        </button>

        {/* DISCONNECT POPUP - FIXED MODAL */}
        {showWalletModal && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="bg-white rounded-2xl p-6 w-[320px] shadow-2xl">

              {/* HEADER */}
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900">
                  Wallet Connected
                </h3>
                <button
                  onClick={() => setShowWalletModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              {/* ADDRESS */}
              <div className="mb-4 p-3 bg-gray-100 rounded-lg">
                <p className="text-xs text-gray-500 mb-1">Wallet Address</p>
                <p className="text-sm font-mono break-all text-gray-900">
                  {address}
                </p>
              </div>

              {/* DISCONNECT BUTTON */}
              <button
                onClick={() => {
                  disconnect();
                  setShowWalletModal(false);
                }}
                className="w-full py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-bold transition"
              >
                Disconnect Wallet
              </button>
            </div>
          </div>
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
        className="group flex items-center gap-2 px-4 py-2 bg-white hover:bg-gray-50 border border-gray-200 rounded-full transition-all disabled:opacity-50"
      >
        <div className="w-2 h-2 rounded-full shrink-0 bg-red-600" />
        <span className="text-gray-700 text-sm font-bold group-hover:text-black">
          {isConnecting ? 'Connecting...' : 'Connect Wallet'}
        </span>
      </button>

      {/* Modal Pilihan Wallet */}
      {showWalletModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 w-[320px] shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900 font-poppins">
                Connect Wallet
              </h3>
              <button
                onClick={() => {
                  setShowWalletModal(false);
                  setError(null);
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Metamask Status Indicator */}
            {!hasMetamask && (
              <div className="mb-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                <p className="text-sm text-orange-600 font-bold">⚠️ MetaMask not detected</p>
                <p className="text-xs text-orange-500 mt-1">Please install MetaMask extension first</p>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <div className="space-y-3">
              {/* Tombol Metamask */}
              <button
                onClick={handleConnectMetamask}
                disabled={isConnecting}
                className={`w-full flex items-center gap-4 p-4 rounded-xl transition-all border disabled:opacity-50 ${hasMetamask
                  ? 'bg-orange-50 hover:bg-orange-100 border-orange-200'
                  : 'bg-gray-100 border-gray-300 cursor-not-allowed'
                  }`}
              >
                <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center shrink-0">
                  <svg className="w-6 h-6 text-white" viewBox="0 0 40 40" fill="currentColor">
                    <path d="M32.5 5L20 14.5 22.5 9.5 32.5 5z" />
                    <path d="M7.5 5L20 14.5 17.5 9.5 7.5 5z" />
                    <path d="M27.5 29L25 33.5 32 35.5 34 29 27.5 29z" />
                    <path d="M6 29L8 35.5 15 33.5 12.5 29 6 29z" />
                  </svg>
                </div>
                <div className="flex-1 text-left">
                  <p className="font-bold text-gray-900">MetaMask</p>
                  <p className="text-xs text-gray-500">
                    {hasMetamask ? 'Connect to MetaMask' : 'Not installed'}
                  </p>
                </div>
                {hasMetamask && (
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                )}
              </button>

              {/* Tombol Coinbase */}
              <button
                onClick={handleConnectCoinbase}
                disabled={isConnecting}
                className="w-full flex items-center gap-4 p-4 bg-blue-50 hover:bg-blue-100 rounded-xl transition-all border border-blue-200 disabled:opacity-50"
              >
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center shrink-0">
                  <svg className="w-6 h-6 text-white" viewBox="0 0 28 28" fill="currentColor">
                    <circle cx="14" cy="14" r="14" />
                    <path d="M14 4C8.5 4 4 8.5 4 14s4.5 10 10 10 10-4.5 10-10S19.5 4 14 4zm0 18c-4.4 0-8-3.6-8-8s3.6-8 8-8 8 3.6 8 8-3.6 8-8 8z" fill="white" />
                    <path d="M11 13h6v2h-6z" fill="white" />
                  </svg>
                </div>
                <div className="flex-1 text-left">
                  <p className="font-bold text-gray-900">Coinbase Wallet</p>
                  <p className="text-xs text-gray-500">Connect to Coinbase</p>
                </div>
              </button>
            </div>

            {isConnecting && (
              <div className="mt-4 text-center">
                <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                <p className="text-sm text-gray-500 mt-2">Connecting...</p>
              </div>
            )}

            <p className="text-xs text-gray-400 text-center mt-4">
              By connecting, you agree to our Terms of Service
            </p>
          </div>
        </div>
      )}
    </>
  );
}