import type { Metadata } from 'next';
import { Poppins } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';

const poppins = Poppins({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
  variable: '--font-poppins',
});

export const metadata: Metadata = {
  title: 'HookLab AI',
  description: 'Generate viral hooks with AI',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${poppins.variable} antialiased`}>
        <Providers>
          {/* Mini Apps Container - Max Width Constraint */}
          <div className="mx-auto max-w-[430px] min-h-screen bg-black">
            {children}
          </div>
        </Providers>
      </body>
    </html>
  );
}