import type { Metadata } from "next";
import { Roboto, Poppins } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const roboto = Roboto({ 
  subsets: ["latin"], 
  weight: ["400", "500", "700"],
  variable: "--font-roboto",
});

const poppins = Poppins({ 
  subsets: ["latin"], 
  weight: ["400", "600", "700"],
  variable: "--font-poppins",
});

export const metadata: Metadata = {
  title: "HookLab AI - Generate Viral Hooks",
  description: "Generate viral hooks on Base blockchain with AI",
  icons: {
    icon: '/logo_hooklab.jpg',
    apple: '/logo_hooklab.jpg',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/logo_hooklab.jpg" type="image/jpeg" />
      </head>
      <body className={`${roboto.variable} ${poppins.variable} font-roboto bg-black antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}