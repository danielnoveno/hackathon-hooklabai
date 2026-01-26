'use client';

import { useState } from 'react';
import Image from 'next/image';
import UIBackground from './components/UIBackground';
import BottomInputCard from './components/BottomInputCard';
import WalletConnect from './components/WalletConnect'; // Pastikan import ini ada

export default function Home() {
  const [isWalletConnected, setIsWalletConnected] = useState(false);

  const handleWalletConnected = () => {
    console.log("Wallet Connected!");
    setIsWalletConnected(true);
    // Disini nanti logika pindah halaman
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-black">
      <div className="relative w-full max-w-[400px] h-[844px] bg-[#0A0A0A] overflow-hidden shadow-2xl flex flex-col font-roboto">
        
        <UIBackground />

        <div className="relative z-10 flex-1 flex flex-col h-full">
          {/* Header */}
          <div className="mt-12 px-6 flex flex-col items-start gap-4">
             <div className="flex items-center gap-3">
               <div className="relative w-10 h-10 rounded-full overflow-hidden">
                 <Image 
                   src="/logo_hooklab.jpg" 
                   alt="Logo HookLab" 
                   fill 
                   className="object-cover"
                 />
               </div>
               <span className="text-white font-bold text-xl font-poppins tracking-wide">
                 HookLab AI
               </span>
             </div>
             {/* Tombol Wallet Connect di Header (Opsional, kalau mau ada di atas juga) */}
             <div className="absolute top-12 right-6">
                {/* <WalletConnect onConnected={handleWalletConnected} /> */}
             </div>
          </div>

          {/* Tengah */}
          <div className="flex-1 flex flex-col items-center justify-center -mt-20">
            <p className="text-white/60 text-sm mb-3 font-medium tracking-wide">
              AI assistant
            </p>
            <h1 className="text-white text-3xl font-bold text-center leading-snug font-poppins drop-shadow-2xl">
              Please Connect <br />
              Wallet, First !
            </h1>
          </div>

          {/* Bawah */}
          <div className="relative z-20 w-full px-4 pb-12 mt-auto">
            {/* Kartu Input Putih */}
            <BottomInputCard />
            
            <div className="w-full flex justify-center mt-8">
              <div className="w-[130px] h-[5px] bg-white/20 rounded-full" />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}