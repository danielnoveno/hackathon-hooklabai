'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import DarkVeil from './reachbits/DarkVeil';

export default function VideoSimulation({ onModelLoaded, isExiting }: { onModelLoaded?: () => void, isExiting?: boolean }) {
  const [playVideo, setPlayVideo] = useState(false);

  useEffect(() => {
    setPlayVideo(true);
    if (onModelLoaded) onModelLoaded();
  }, [onModelLoaded]);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={{ opacity: isExiting ? 0 : 1 }}
      transition={{ duration: 1, ease: "easeInOut" }}
      className="relative w-full h-screen bg-[#020408] flex flex-col items-center justify-center overflow-hidden font-sans text-white"
    >

      {/* 1. BACKGROUND ATMOSPHERE: DARK VEIL */}
      <div className="absolute inset-0 z-0">
        <DarkVeil
          hueShift={28}
          noiseIntensity={0}
          scanlineIntensity={0.37}
          speed={1.8}
          scanlineFrequency={2.1}
          warpAmount={0}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black opacity-60 pointer-events-none" />
      </div>

      {/* 2. CENTER CONTENT */}
      {/* Diangkat sedikit (-translate-y-10) agar komposisi tetap seimbang di tengah mata */}
      <div className="relative z-20 flex flex-col items-center justify-center w-full transform -translate-y-10">

        {/* LOGO CONTAINER */}
        <div className="relative w-28 h-28 flex items-center justify-center">
          <div className="relative w-full h-full">
            <img
              src="/logo_hooklab.png" 
              alt="HookLab Logo"
              className="w-full h-full object-contain drop-shadow-[0_0_25px_rgba(59,130,246,0.6)]"
            />
            {/* Shine Overlay */}
            <div
              className="absolute inset-0 z-10 pointer-events-none mix-blend-overlay"
              style={{
                maskImage: 'url(/logo_hooklab.png)',
                WebkitMaskImage: 'url(/logo_hooklab.png)',
                maskSize: 'contain',
                WebkitMaskSize: 'contain',
                maskRepeat: 'no-repeat',
                WebkitMaskRepeat: 'no-repeat',
                maskPosition: 'center',
                WebkitMaskPosition: 'center',
              }}
            >
              <div className="w-[200%] h-full bg-gradient-to-r from-transparent via-white/80 to-transparent skew-x-[-20deg] animate-shine" />
            </div>
          </div>
        </div>

        {/* 3. TEXT DESCRIPTION */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          // UPDATE: Menggunakan mt-8 untuk memberi jarak (space) yang jelas dari logo
          className="z-10 text-center max-w-[200px] mt-8 px-2 relative"
        >
          <p className="text-blue-100/70 text-[10px] leading-tight font-medium tracking-wide line-clamp-2 text-center">
            Generate viral Farcaster hooks powered by real Base channel trends
            with blind selection.
          </p>
        </motion.div>

        {/* 4. LOADING BAR */}
        {/* UPDATE: Menggunakan mt-5 agar tidak terlalu mepet dengan teks */}
        <div className="mt-5 w-10 h-[2px] bg-gray-800/50 rounded-full overflow-hidden">
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: "100%" }}
            transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
            className="w-full h-full bg-blue-500 blur-[1px]"
          />
        </div>

      </div>

      <style jsx global>{`
        @keyframes shine {
          0% { transform: translateX(-150%); }
          100% { transform: translateX(150%); }
        }
        .animate-shine {
          animation: shine 2.5s infinite linear;
        }
      `}</style>
    </motion.div>
  );
}