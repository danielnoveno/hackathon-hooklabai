'use client';

import { OnchainKitProvider } from '@coinbase/onchainkit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { base } from 'wagmi/chains';
import { http, createConfig, WagmiProvider } from 'wagmi';
import { coinbaseWallet } from 'wagmi/connectors';
import { useState, type ReactNode } from 'react';

export function Providers({ children }: { children: ReactNode }) {
  const [config] = useState(() =>
    createConfig({
      chains: [base],
      connectors: [
        coinbaseWallet({
          appName: 'HookLab AI',
        }),
      ],
      // PERBAIKAN: Set ssr ke false agar tidak error rehydrate
      ssr: false, 
      transports: {
        [base.id]: http(),
      },
    })
  );

  const [queryClient] = useState(() => new QueryClient());

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <OnchainKitProvider
          apiKey={process.env.NEXT_PUBLIC_ONCHAINKIT_API_KEY}
          chain={base}
        >
          {children}
        </OnchainKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}