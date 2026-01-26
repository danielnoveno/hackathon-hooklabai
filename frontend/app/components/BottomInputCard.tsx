'use client';

import React from 'react';
import WalletConnectComponent from './WalletConnect';

export default function BottomInputCard() {
  return (
    // PERBAIKAN: Pastikan 'bg-white' ada dan z-index tinggi agar tidak tertutup background
    <div className="w-full bg-white rounded-[20px] p-5 relative z-30 shadow-lg min-h-[140px] flex flex-col justify-between">
      
      {/* Teks Prompt (Abu-abu & Kecil sesuai desain) */}
      <p className="text-black/40 text-xs font-bold font-roboto tracking-wide">
        What do you want to post about?
      </p>

      {/* Area Tombol */}
      <div className="flex items-center">
        <WalletConnectComponent />
      </div>

    </div>
  );
}