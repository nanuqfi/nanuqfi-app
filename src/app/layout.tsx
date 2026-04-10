import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: 'NanuqFi — AI-Powered Yield Routing',
  description: 'Protocol-agnostic yield routing layer for DeFi. Deposit USDC, pick a risk level, earn optimized yield.',
  openGraph: {
    title: 'NanuqFi — AI-Powered Yield Routing',
    description: 'Protocol-agnostic yield routing layer for DeFi.',
    url: 'https://nanuqfi.com',
    siteName: 'NanuqFi',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'NanuqFi — AI-Powered Yield Routing',
    description: 'Protocol-agnostic yield routing layer for DeFi.',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark antialiased">
      <body
        className={`${geistSans.variable} ${geistMono.variable} font-sans bg-[#080B11] text-slate-50`}
      >
        {children}
      </body>
    </html>
  );
}
