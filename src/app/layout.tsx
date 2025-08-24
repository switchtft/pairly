import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import ClientProviders from './ClientProviders';
import ResponsiveNavbar from '@/components/ResponsiveNavbar';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
  display: 'swap',
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
  display: 'swap',
});

export const metadata = {
  title: 'Pairly - Find Your Gaming Partner',
  description: 'Connect with top players for duo services, coaching, and tournaments',
  keywords: 'gaming, duo, coaching, tournaments, esports, valorant, league of legends, csgo',
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="antialiased text-white min-h-screen flex flex-col bg-background-darker" suppressHydrationWarning={true}>
        <ClientProviders>
          <ResponsiveNavbar />
          {children}
        </ClientProviders>
      </body>
    </html>
  );
}