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
  title: "NanuqFi — Yield, Routed.",
  description: "AI-powered USDC yield routing across Kamino, Marginfi, and Lulo. Transparent allocations, real-time guardrails, and autonomous rebalancing.",
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
