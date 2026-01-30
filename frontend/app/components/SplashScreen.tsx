'use client';

import { useEffect, useState } from 'react';
import DomeGlobe from './DomeGlobe';

type SplashScreenProps = {
  onFinish: () => void;
};

export default function SplashScreen({ onFinish }: SplashScreenProps) {
  const [fadeOut, setFadeOut] = useState(false);
  const [currentZoomLevel, setCurrentZoomLevel] = useState<'globe' | 'particles' | 'threads'>('globe');

  const handleZoomLevelChange = (level: 'globe' | 'particles' | 'threads') => {
    setCurrentZoomLevel(level);
  };

  const handleGetStarted = () => {
    setFadeOut(true);
    setTimeout(() => onFinish(), 500);
  };

  return (
    <div className="fixed inset-0 bg-gray-900 flex items-center justify-center">
      {/* Mini Apps Container - Mobile Size */}
      <div 
        className={`
          relative w-full max-w-[430px] h-full max-h-[932px]
          bg-black overflow-hidden
          transition-opacity duration-500
          shadow-2xl
          ${fadeOut ? 'opacity-0' : 'opacity-100'}
        `}
        style={{ aspectRatio: '430 / 932' }}
      >
        {/* Aurora Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Base gradient */}
          <div className="absolute inset-0 bg-gradient-to-b from-black via-[#0a0e1a] to-black" />
          
          {/* Aurora effects */}
          <div className="absolute top-0 left-0 w-full h-full">
            <div 
              className="absolute top-1/4 left-1/4 w-[400px] h-[300px] bg-blue-600/20 rounded-full blur-[100px] animate-aurora-1"
            />
            <div 
              className="absolute top-1/3 right-1/4 w-[350px] h-[250px] bg-indigo-600/15 rounded-full blur-[80px] animate-aurora-2"
            />
            <div 
              className="absolute bottom-1/4 left-1/3 w-[300px] h-[200px] bg-purple-600/10 rounded-full blur-[70px] animate-aurora-3"
            />
            <div 
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[250px] h-[250px] bg-cyan-500/10 rounded-full blur-[120px] animate-pulse"
            />
          </div>
          
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-950/5 to-transparent opacity-50" />
        </div>

        {/* Globe Container */}
        <div className="absolute inset-0" style={{ pointerEvents: 'auto' }}>
          <DomeGlobe onZoomLevelChange={handleZoomLevelChange} />
        </div>

        {/* Content Overlay */}
        <div 
          className={`
            absolute inset-0 flex flex-col items-center justify-center px-6
            transition-opacity duration-500
            pointer-events-none
            ${currentZoomLevel === 'threads' ? 'opacity-0' : 'opacity-100'}
          `}
          style={{ zIndex: 100 }}
        >
          <div className="text-center animate-fade-in-up">
            
            {/* Logo */}
            <div className="mb-6 flex justify-center pointer-events-none">
              <div className="relative w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-2xl shadow-blue-500/50 animate-float">
                <div className="w-14 h-14 rounded-full bg-black flex items-center justify-center overflow-hidden">
                  <img 
                    src="/logo_hooklab.jpg" 
                    alt="Logo HookLab" 
                    className='w-full h-full rounded-full object-cover'
                  />
                </div>
              </div>
            </div>

            {/* Title */}
            <h1 className="text-white text-3xl font-bold font-poppins mb-3 tracking-tight pointer-events-none">
              HookLab AI
            </h1>

            {/* Subtitle */}
            <p className="text-white/60 text-sm font-medium mb-8 pointer-events-none">
              Generate viral hooks with AI
            </p>

            {/* Get Started Button */}
            <button
              onClick={handleGetStarted}
              className="group relative px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold text-base rounded-full overflow-hidden transition-all duration-300 hover:scale-105 active:scale-95 hover:shadow-2xl hover:shadow-blue-500/50 cursor-pointer pointer-events-auto"
              style={{ zIndex: 101 }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity blur-xl" />
              
              <span className="relative flex items-center gap-2">
                Get Started
                <svg 
                  className="w-5 h-5 transition-transform group-hover:translate-x-1" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M13 7l5 5m0 0l-5 5m5-5H6" 
                  />
                </svg>
              </span>
            </button>

            {/* Hint text */}
            <p className="text-white/40 text-xs mt-6 animate-fade-in-delayed pointer-events-none">
              Drag the globe to explore
            </p>

          </div>
        </div>

        {/* Bottom gradient */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black to-transparent pointer-events-none" style={{ zIndex: 50 }} />
      </div>

      <style jsx>{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-10px);
          }
        }

        @keyframes aurora-1 {
          0%, 100% {
            transform: translate(0, 0) scale(1);
            opacity: 0.2;
          }
          33% {
            transform: translate(30px, -20px) scale(1.1);
            opacity: 0.25;
          }
          66% {
            transform: translate(-20px, 30px) scale(0.95);
            opacity: 0.15;
          }
        }

        @keyframes aurora-2 {
          0%, 100% {
            transform: translate(0, 0) scale(1);
            opacity: 0.15;
          }
          33% {
            transform: translate(-30px, 40px) scale(1.05);
            opacity: 0.2;
          }
          66% {
            transform: translate(40px, -15px) scale(0.9);
            opacity: 0.12;
          }
        }

        @keyframes aurora-3 {
          0%, 100% {
            transform: translate(0, 0) scale(1);
            opacity: 0.1;
          }
          33% {
            transform: translate(20px, 30px) scale(1.08);
            opacity: 0.15;
          }
          66% {
            transform: translate(-35px, -20px) scale(0.92);
            opacity: 0.08;
          }
        }

        .animate-aurora-1 {
          animation: aurora-1 20s ease-in-out infinite;
        }

        .animate-aurora-2 {
          animation: aurora-2 25s ease-in-out infinite;
          animation-delay: 2s;
        }

        .animate-aurora-3 {
          animation: aurora-3 30s ease-in-out infinite;
          animation-delay: 4s;
        }

        .animate-fade-in-up {
          animation: fade-in-up 1s ease-out 0.5s both;
        }

        .animate-fade-in-delayed {
          animation: fade-in-up 1s ease-out 1.5s both;
        }

        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}