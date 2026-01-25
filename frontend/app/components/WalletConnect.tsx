'use client';

import { ConnectWallet, Wallet } from '@coinbase/onchainkit/wallet';
import { useAccount } from 'wagmi';
import { useEffect } from 'react';

interface WalletConnectProps {
  onConnected?: () => void;
}

export default function WalletConnect({ onConnected }: WalletConnectProps) {
  const { isConnected } = useAccount();

  useEffect(() => {
    if (isConnected && onConnected) {
      onConnected();
    }
  }, [isConnected, onConnected]);

  return (
    <Wallet>
      <ConnectWallet />
    </Wallet>
  );
}
