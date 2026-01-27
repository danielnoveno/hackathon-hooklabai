'use client';

import { useState } from 'react';

type NameInputModalProps = {
  isOpen: boolean;
  onSubmit: (name: string) => void;
};

export default function NameInputModal({ isOpen, onSubmit }: NameInputModalProps) {
  const [name, setName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onSubmit(name.trim());
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="bg-white rounded-2xl p-6 w-[320px] shadow-2xl">
        <div className="mb-4">
          <h3 className="text-xl font-bold text-gray-900 font-poppins mb-2">
            Welcome! 👋
          </h3>
          <p className="text-sm text-gray-600">
            What should we call you?
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your name..."
            autoFocus
            className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
          />

          <button
            type="submit"
            disabled={!name.trim()}
            className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Continue
          </button>
        </form>

        <p className="text-xs text-gray-400 text-center mt-4">
          This helps us personalize your experience
        </p>
      </div>
    </div>
  );
}