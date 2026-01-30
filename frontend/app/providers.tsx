'use client';

import { WagmiProvider, createConfig, http } from 'wagmi';
import { baseSepolia, foundry } from 'wagmi/chains';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { injected, coinbaseWallet } from 'wagmi/connectors';
import { ReactNode } from 'react';

const chains = [baseSepolia, foundry] as const;
const configuredChainId = Number(process.env.NEXT_PUBLIC_CHAIN_ID);

// Sort chains so the configured one is first (default)
const sortedChains = [...chains].sort((a, b) => {
  if (a.id === configuredChainId) return -1;
  if (b.id === configuredChainId) return 1;
  return 0;
});

// Create wagmi config
const config = createConfig({
  chains: [sortedChains[0], ...sortedChains.slice(1)], // Type-safe array spread
  connectors: [
    injected(),
    coinbaseWallet({
      appName: 'HookLab AI',
    }),
  ],
  transports: {
    [baseSepolia.id]: http(),
    [foundry.id]: http(),
  },
});

// Create query client
const queryClient = new QueryClient();

type ProvidersProps = {
  children: ReactNode;
};

export function Providers({ children }: ProvidersProps) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  );
}