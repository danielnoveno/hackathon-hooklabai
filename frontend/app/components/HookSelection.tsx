'use client';

import { useState } from 'react';
import { DUMMY_HOOKS } from '../data/dummyHooks';
import type { TopicKey } from '../config/topicPrompts';

type Hook = {
  id: string;
  username: string;
  topic: string;
  content: string;
  preview: string;
};

type HooksSelectionProps = {
  onSelectHook: (hook: Hook) => void;
  onBack: () => void;
  userName: string;
  generatedHooks : Hook[]; 
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

export default function HooksSelection({ onSelectHook, onBack, userName, generatedHooks }: HooksSelectionProps) {
  // Mock data - nanti bisa diganti dengan data dari API
  const hooks = generatedHooks; 

  return (
    <div className="flex-1 flex flex-col bg-black overflow-y-auto">
      {/* Header */}
      <div className="pt-12 px-6 pb-6 flex items-center gap-3">
        <button
          onClick={onBack}
          className="w-8 h-8 flex items-center justify-center text-white/60 hover:text-white transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div className="relative w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
          <img src="/logo_hooklab.jpg" alt="Logo HookLab AI" />
        </div>
        <span className="text-white font-bold text-xl font-poppins tracking-wide">
          HookLab AI
        </span>
      </div>

      {/* Title */}
      <div className="px-6 pb-6">
        <h1 className="text-white text-3xl font-bold text-center font-poppins">
          Choose One !
        </h1>
      </div>

      {/* Hooks List */}
      <div className="flex-1 px-6 pb-6 space-y-4">
        {hooks.map((hook) => (
          <div
            key={hook.id}
            onClick={() => onSelectHook(hook)}
            className="bg-[#1A1A1A] rounded-2xl p-4 border border-white/10 hover:border-blue-500/50 transition-all cursor-pointer"
          >
            {/* Header Card */}
            <div className="flex items-center justify-between mb-3">
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

            {/* Content */}
            <p className="text-white text-sm leading-relaxed">
              {hook.preview}
              {' '}
              <span className="text-blue-400 font-medium cursor-pointer">more</span>
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}