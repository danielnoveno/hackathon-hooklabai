'use client';

import { sdk } from '@farcaster/miniapp-sdk';
import { useEffect } from 'react';

export default function FarcasterSDK() {
  useEffect(() => {
    const init = async () => {
      try {
        console.log('Initializing Farcaster SDK...');
        await sdk.actions.ready();
        console.log('Farcaster SDK ready');
      } catch (error) {
        console.error('Failed to initialize Farcaster SDK:', error);
      }
    };
    init();
  }, []);

  return null;
}
