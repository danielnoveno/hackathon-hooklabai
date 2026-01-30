'use client';

import { useState } from 'react';
import { useAccount } from 'wagmi';
import { userStorage } from '../../utils/userStorage';

/**
 * Developer Tools Component
 * Untuk testing dan debugging user storage
 * Hapus component ini di production
 */
export default function DevTools() {
  const { address } = useAccount();
  const [isOpen, setIsOpen] = useState(false);

  if (!address) return null;

  const userData = userStorage.getUserData(address);

  const handleResetUser = () => {
    if (confirm('Reset user data? This will clear name and reset credits to 5.')) {
      userStorage.clearUserData(address);
      window.location.reload();
    }
  };

  const handleAddCredits = () => {
    const current = userStorage.getCredits(address);
    userStorage.updateCredits(address, current + 5);
    window.location.reload();
  };

  const handleRemoveCredits = () => {
    const current = userStorage.getCredits(address);
    userStorage.updateCredits(address, Math.max(0, current - 1));
    window.location.reload();
  };

  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-4 left-4 z-[9999] w-12 h-12 bg-purple-600 hover:bg-purple-700 text-white rounded-full shadow-lg flex items-center justify-center transition-all"
        title="Developer Tools"
      >
        🛠️
      </button>

      {/* Dev Panel */}
      {isOpen && (
        <div className="fixed bottom-20 left-4 z-[9999] bg-white rounded-xl shadow-2xl p-4 w-[280px] border border-gray-200">
          <div className="flex items-center justify-between mb-3 pb-2 border-b">
            <h3 className="font-bold text-gray-900">Dev Tools</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>

          {/* User Data Display */}
          <div className="bg-gray-50 rounded-lg p-3 mb-3 text-xs">
            <div className="flex justify-between mb-1">
              <span className="text-gray-600">Name:</span>
              <span className="font-bold text-gray-900">{userData?.name || 'Not set'}</span>
            </div>
            <div className="flex justify-between mb-1">
              <span className="text-gray-600">Credits:</span>
              <span className="font-bold text-gray-900">{userData?.credits ?? 5}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Address:</span>
              <span className="font-mono text-gray-900 text-[10px]">
                {address.slice(0, 6)}...{address.slice(-4)}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-2">
            <button
              onClick={handleAddCredits}
              className="w-full px-3 py-2 bg-green-100 hover:bg-green-200 text-green-700 rounded-lg text-sm font-medium transition-colors"
            >
              + Add 5 Credits
            </button>
            
            <button
              onClick={handleRemoveCredits}
              className="w-full px-3 py-2 bg-orange-100 hover:bg-orange-200 text-orange-700 rounded-lg text-sm font-medium transition-colors"
            >
              - Remove 1 Credit
            </button>
            
            <button
              onClick={handleResetUser}
              className="w-full px-3 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg text-sm font-medium transition-colors"
            >
              🔄 Reset User Data
            </button>
          </div>

          <p className="text-[10px] text-gray-400 text-center mt-3">
            For development only
          </p>
        </div>
      )}
    </>
  );
}