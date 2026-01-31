'use client';

import { useState } from 'react';
import { DUMMY_HOOKS } from '../data/dummyHooks';
import type { TopicKey } from '../config/topicPrompts';
import PrismaticBurst from './PrismaticBurst';

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
  generatedHooks: Hook[];
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
  // Use generated hooks if available, otherwise fallback to empty or dummy
  const hooks: Hook[] = generatedHooks.length > 0 ? generatedHooks : [
    {
      id: 'insp-1',
      username: 'qwert',
      topic: 'Inspiration',
      content: '🚀 New year, new chapter. Opportunities are knocking—don’t just hear them, answer with bold action. This is your moment to redefine what is possible.',
      preview: '🚀 New year, new chapter. Opportunities are knocking—don’t just hear...'
    }
  ];

  return (
    <div className="flex-1 flex flex-col items-center bg-black overflow-hidden relative w-full h-full">
      {/* Background Effect */}
      <div className="absolute inset-0 z-0">
        <PrismaticBurst
          intensity={1.8}
          speed={0.9}
          animationType="rotate"
          colors={["#0000ff", "#00006f"]}
          distort={0.1}
          hoverDampness={0.3}
          rayCount={2}
        />
      </div>

      {/* FIXED TOP SECTION (Header + Title) */}
      <div className="absolute top-0 left-0 right-0 z-[100] flex flex-col items-center w-full">
        {/* Stronger Backdrop for better separation */}
        <div className="absolute inset-0 bg-black/90 backdrop-blur-3xl border-b border-white/5 -z-10 shadow-2xl" />

        {/* Header - Pill Style with Back Button */}
        <div className="w-full max-w-md pt-8 px-6 pb-2 flex items-center justify-between relative">
          <button
            onClick={onBack}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/20 transition-all backdrop-blur-md"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-3 px-5 py-2 bg-white/5 backdrop-blur-md border border-white/10 rounded-full shadow-lg">
            <div className="relative w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center p-[1px]">
              <div className="w-full h-full rounded-full bg-black flex items-center justify-center overflow-hidden">
                <img src="/logo_hooklab.png" alt="HookLab" className="w-full h-full object-cover" />
              </div>
            </div>
            <span className="text-white font-bold text-sm font-poppins tracking-wide">HookLab AI</span>
          </div>

          <div className="w-10"></div> {/* Spacer for balance */}
        </div>

        {/* Title */}
        <div className="w-full max-w-md px-6 pb-4 animate-pop-in-up" style={{ animationDelay: '100ms' }}>
          <h1 className="text-transparent bg-clip-text bg-gradient-to-r from-white via-white/90 to-white/70 text-3xl font-bold text-center font-poppins drop-shadow-sm">
            Choose One !
          </h1>
        </div>
      </div>

      {/* SCROLLABLE CONTENT (List) */}
      {/* Added extra top padding to clear the fixed header area comfortably */}
      <div className="relative z-10 w-full flex flex-col items-center overflow-y-auto h-full pt-[160px]">
        {/* Hooks List */}
        <div className="w-full max-w-md flex-1 px-6 pb-8 space-y-5">
          {hooks.map((hook, index) => (
            <div
              key={hook.id}
              onClick={() => onSelectHook(hook)}
              role="button"
              tabIndex={0}
              className="group relative bg-white/[0.03] backdrop-blur-xl rounded-2xl p-5 border border-white/[0.08] hover:bg-white/[0.08] hover:border-white/20 transition-all duration-500 cursor-pointer shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] hover:shadow-[0_8px_32px_0_rgba(31,38,135,0.37)] hover:-translate-y-1 overflow-hidden animate-pop-in-up opacity-0"
              style={{ animationDelay: `${200 + index * 100}ms` }}
            >
              {/* Glass Shine Effect */}
              <div className="absolute inset-0 bg-gradient-to-tr from-white/[0.05] via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

              {/* Subtle radial gradient for depth */}
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-500/[0.05] via-transparent to-transparent opacity-50 pointer-events-none" />

              {/* Header Card */}
              <div className="relative flex items-center justify-between mb-3 z-10">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-full bg-gradient-to-br ${getAvatarColor(
                      hook.username
                    )} flex items-center justify-center text-white text-sm font-bold shadow-inner ring-1 ring-white/20`}
                  >
                    {getInitial(hook.username)}
                  </div>
                  <span className="text-white/90 font-medium tracking-wide drop-shadow-sm">{hook.username}</span>
                </div>
                <span className="px-3 py-1 bg-white/5 border border-white/10 text-white/80 text-[10px] uppercase tracking-wider rounded-full font-semibold backdrop-blur-md shadow-sm group-hover:bg-blue-500/20 group-hover:text-blue-200 group-hover:border-blue-500/30 transition-colors duration-300">
                  {hook.topic}
                </span>
              </div>

              {/* Content */}
              <p className="relative text-white/70 text-sm leading-relaxed z-10 font-light group-hover:text-white/90 transition-colors duration-300">
                {hook.content.split(' ').slice(0, 15).join(' ') + (hook.content.split(' ').length > 15 ? '...' : '')}
                {' '}
                <span className="text-blue-400/80 font-medium ml-1 group-hover:text-blue-300 transition-colors">more</span>
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}