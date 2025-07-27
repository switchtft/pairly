// src/app/layout.tsx
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ResponsiveNavbar from "@/components/ResponsiveNavbar";
import Footer from "@/components/Footer";
import ScrollToTop from "@/components/ScrollToTop";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: 'swap',
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: "Pairly - Find Your Gaming Partner",
    template: "%s | Pairly"
  },
  description: "Connect with top players for duo services, coaching, and tournaments",
  keywords: ["gaming", "duo", "coaching", "tournaments", "esports", "valorant", "league of legends", "csgo"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="antialiased bg-[#0d0d0d] text-white min-h-screen flex flex-col">
        <ResponsiveNavbar />
        <main className="flex-grow pt-16 pb-8">
          {children}
        </main>
        <Footer />
        <ScrollToTop />
      </body>
    </html>
  );
}