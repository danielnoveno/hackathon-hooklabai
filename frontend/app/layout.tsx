import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'HookLab AI - Generate Viral Farcaster Hooks',
  description: 'AI-powered hook generation using real Base channel trends. Blind selection mechanism with onchain premium subscriptions.',
  keywords: ['Farcaster', 'Base', 'AI', 'Web3', 'Hooks', 'Content Creation'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
