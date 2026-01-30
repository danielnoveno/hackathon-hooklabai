'use client';

import React from 'react';
import WalletConnectComponent from './WalletConnect';

export default function BottomInputCard() {
  return (
    <div className="w-full bg-white rounded-[20px] p-5 relative z-30 shadow-lg min-h-[140px] flex flex-col justify-between">
      {/* Area Tombol */}
      <div className="flex items-center">
        <WalletConnectComponent />
      </div>

    </div>
  );
}