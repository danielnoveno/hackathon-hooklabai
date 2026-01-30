import type { Metadata } from 'next';
import './globals.css';
import { Providers } from './providers';
import { Toaster } from 'react-hot-toast'; // Pastikan sudah install: npm install react-hot-toast

export const metadata: Metadata = {
  title: 'HookLab AI',
  description: 'Generate viral hooks with AI',
  icons: {
    icon: '/logo_hooklab.png',
    shortcut: '/logo_hooklab.png',
    apple: '/logo_hooklab.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`antialiased`}>
        <Providers>
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