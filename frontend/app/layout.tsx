import type { Metadata } from "next";
import { Roboto, Poppins } from "next/font/google"; // Import Font
import "./globals.css";
import { Providers } from "./providers";
import '@coinbase/onchainkit/styles.css';

// Setup Font Config
const roboto = Roboto({ 
  subsets: ["latin"], 
  weight: ["400", "500", "700"],
  variable: "--font-roboto",
});

const poppins = Poppins({ 
  subsets: ["latin"], 
  weight: ["400", "600"],
  variable: "--font-poppins",
});

export const metadata: Metadata = {
  title: "HookLab AI",
  description: "Generate viral hooks on Base",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      {/* Masukkan variabel font ke body */}
      <body className={`${roboto.variable} ${poppins.variable} font-sans bg-black`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}