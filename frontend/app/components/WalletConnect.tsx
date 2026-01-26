'use client';

import { 
  ConnectWallet, 
  Wallet, 
  WalletDropdown, 
  WalletDropdownDisconnect, 
  WalletDropdownLink 
} from '@coinbase/onchainkit/wallet';
import { 
  Address, 
  Avatar, 
  Name, 
  Identity, 
  EthBalance 
} from '@coinbase/onchainkit/identity';
import { useAccount } from 'wagmi';
import { useEffect } from 'react';

// PERBAIKAN 1: Tambahkan definisi Props agar tidak error di page.tsx
type WalletConnectProps = {
  onConnected?: () => void;
};

export default function WalletConnectComponent({ onConnected }: WalletConnectProps) {
  const { isConnected } = useAccount();

  // Trigger fungsi onConnected jika wallet berhasil connect
  useEffect(() => {
    if (isConnected && onConnected) {
      onConnected();
    }
  }, [isConnected, onConnected]);

  return (
    <Wallet>
      {/* PERBAIKAN 2: Hapus 'withWalletAggregator' yg bikin error */}
      <ConnectWallet 
        className="group flex items-center gap-2 px-4 py-2 bg-white hover:bg-gray-100 border border-gray-300 rounded-full transition-all min-w-0"
      >
        <div className="w-2 h-2 rounded-full bg-red-600 shrink-0" />
        <span className="text-gray-700 text-sm font-bold font-roboto group-hover:text-black">
          Connect Wallet
        </span>
      </ConnectWallet>

      <WalletDropdown>
        <Identity className="px-4 pt-3 pb-2" hasCopyAddressOnClick>
          <Avatar />
          <Name />
          <Address />
          <EthBalance />
        </Identity>
        <WalletDropdownLink icon="wallet" href="https://keys.coinbase.com">
          Wallet
        </WalletDropdownLink>
        <WalletDropdownDisconnect />
      </WalletDropdown>
    </Wallet>
  );
}