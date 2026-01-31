import type { Metadata } from 'next';
import './globals.css';
import { Providers } from './providers';
import { Toaster } from 'react-hot-toast'; // Pastikan sudah install: npm install react-hot-toast
import FarcasterSDK from '@/components/FarcasterSDK';

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'HookLab AI',
    description: 'Generate viral hooks with AI',
    icons: {
      icon: '/minikit-logo.png',
      shortcut: '/minikit-logo.png',
      apple: '/minikit-logo.png',
    },
    other: {
      'fc:miniapp': JSON.stringify({
        version: 'next',
        imageUrl: 'https://minikit-test-hooklabai.vercel.app/og.png', // Fallback image
        button: {
          title: 'Launch HookLab AI',
          action: {
            type: 'launch_miniapp',
            name: 'HookLab AI',
            url: 'https://minikit-test-hooklabai.vercel.app',
            splashImageUrl: 'https://minikit-test-hooklabai.vercel.app/minikit-logo.png',
            splashBackgroundColor: '#000000',
          },
        },
      }),
    },
  };
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`antialiased`}>
        <Providers>
          <FarcasterSDK />
          {/* Main Container Mini App */}
          <div className="mx-auto max-w-[430px] min-h-screen bg-black relative shadow-2xl overflow-hidden">

            {/* SETUP TOAST KHUSUS MINI APP */}
            <Toaster
              position="top-center"
              containerStyle={{
                position: 'absolute', // Mengunci posisi
                top: 20,              // Jarak dari atas HP
                left: 0,
                right: 0,
                bottom: 0,
                pointerEvents: 'none', // Supaya bisa klik di belakang toast
                maxWidth: '430px',     // Kunci lebar agar tidak melebar ke monitor
                margin: '0 auto',      // Tengah secara horizontal
              }}
              toastOptions={{
                style: {
                  background: 'rgba(30, 30, 30, 0.9)',
                  color: '#fff',
                  fontSize: '13px',
                  borderRadius: '12px',
                  border: '1px solid rgba(255,255,255,0.1)',
                  backdropFilter: 'blur(8px)',
                },
                success: {
                  iconTheme: { primary: '#4ade80', secondary: '#fff' },
                },
                error: {
                  iconTheme: { primary: '#ef4444', secondary: '#fff' },
                },
              }}
            />

            {children}
          </div>
        </Providers>
      </body>
    </html>
  );
}